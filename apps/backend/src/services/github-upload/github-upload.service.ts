import { Injectable, BadRequestException, MessageEvent, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GitHubUpload, UploadStatus } from '@/generated/prisma/client';
import { SchematicService } from '@/services/schematic/schematics.service';
import { api } from '@mindustry-tool/api';
import { ApiBody, ApiQuery } from '@mindustry-tool/api';
import * as fs from 'fs/promises';
import { Subject } from 'rxjs';
import path from 'path';
import { MapService } from '@/services/map/map.service';
import { ConfigService } from '@nestjs/config';
import { OctokitService } from '@/services/octokit/octokit.service';
import AdmZip from 'adm-zip';

interface DownloadResult {
  success: boolean;
  uploadId: string;
  files: string[];
  error?: string;
}

@Injectable()
export class GitHubUploadService {
  private readonly logger = new Logger(GitHubUploadService.name);
  private readonly users = new Map<string, ConnectedUser>();
  private data: UploadSSE[] = [];
  private readonly uploadDataFolder: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mapService: MapService,
    private readonly schematicService: SchematicService,
    private readonly configService: ConfigService,
    private readonly octokitService: OctokitService,
  ) {
    this.uploadDataFolder = this.configService.get<string>('upload.dataFolder') || './upload-data';
    void this.ensureUploadFolderExists();
  }

  /**
   * Validate GitHub URL format
   */
  private validateGitHubUrl(url: string): boolean {
    const githubUrlPattern = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
    return githubUrlPattern.test(url);
  }

  /**
   * Create a new GitHub upload request
   */
  async createUpload(createUploadDto: ApiBody<typeof api.v4.githubUploads.create>, createdBy: string) {
    const { authorId, githubUrl } = createUploadDto;

    // Validate GitHub URL
    if (!this.validateGitHubUrl(githubUrl)) {
      throw new BadRequestException('Invalid GitHub URL format');
    }

    const [_, existingUpload] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({
        where: { id: authorId },
      }),
      this.prisma.gitHubUpload.findFirst({
        where: {
          githubUrl,
        },
      }),
    ]);

    if (existingUpload) {
      throw new BadRequestException('Upload for this repository is already exists');
    }

    // Create the upload
    await this.prisma.gitHubUpload.create({
      data: {
        githubUrl,
        authorId,
        createdBy,
        status: UploadStatus.PENDING,
        createdAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    this.processPendingUploads().catch((error) => {
      this.logger.error('Failed to process pending uploads:', error);
    });
  }

  /**
   * Get upload by ID
   */
  async getUploadById(id: string): Promise<GitHubUpload | null> {
    return this.prisma.gitHubUpload.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  /**
   * List uploads with pagination and filtering
   */
  async findAll(query: ApiQuery<typeof api.v4.githubUploads.findAll>) {
    const { page, size, status } = query;
    const skip = page * size;

    const where = status ? { status } : {};

    return this.prisma.gitHubUpload.findMany({
      where,
      skip,
      take: size,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });
  }

  async count(query: ApiQuery<typeof api.v4.githubUploads.count>) {
    const { status } = query;
    const where = status ? { status } : {};

    return this.prisma.gitHubUpload.count({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update upload status
   */
  async updateUploadStatus(id: string, status: UploadStatus): Promise<GitHubUpload> {
    return this.prisma.gitHubUpload.update({
      where: { id },
      data: { status },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    this.processPendingUploads().catch((error) => this.logger.error('Failed to process pending uploads:', error));
  }

  async update(id: string, updateUploadDto: ApiBody<typeof api.v4.githubUploads.update>) {
    await this.prisma.gitHubUpload.update({
      where: { id },
      data: { ...updateUploadDto, createdAt: new Date() },
    });

    this.processPendingUploads().catch((error) => this.logger.error('Failed to process pending uploads:', error));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.gitHubUpload.delete({
      where: { id },
    });
  }

  async getPendingUploads(): Promise<GitHubUpload[]> {
    return this.prisma.gitHubUpload.findMany({
      where: {
        status: UploadStatus.PENDING,
      },
    });
  }

  async handleDiscordUpload(event: { file: string; fileType: string; userId: string; }): Promise<void> {
    try {
      const file = Buffer.from(event.file, 'base64');
      const { fileType, userId } = event;

      this.logger.log(`Received discord upload event for userId: ${userId} with file type: ${fileType}`);

      if (fileType === 'msch' || fileType === 'txt') {
        await this.schematicService.uploadByUser(file, userId);
      } else if (fileType === 'msav') {
        await this.mapService.uploadByUser(file, userId);
      } else {
        this.logger.error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      this.logger.error('Failed to process discord upload:', error);
    }
  }

  async handleUploadProcessed(event: { authorId: string; uploadId: string; files: string[] }): Promise<void> {
    this.data = this.data.filter((item) => item.data.uploadId !== event.uploadId);

    this.logger.log(`Received upload processed event for uploadId: ${event.uploadId}, files: ${event.files.length}`);

    const total = event.files.length;
    let success = 0;
    let fail = 0;
    let duplicate = 0;

    for (let index = 0; index < event.files.length; index++) {
      const filePath = event.files[index];
      const fileType = path.extname(filePath);

      try {
        const file = await fs.readFile(filePath);

        if (fileType === '.msch') {
          await this.schematicService.uploadByUser(Buffer.from(file), event.authorId);

          this.broadcast('upload:success', {
            uploadId: event.uploadId,
            fileType: fileType,
            filePath: filePath,
            index,
            message: 'Success',
          });
        } else if (fileType === '.msav') {
          await this.mapService.uploadByUser(Buffer.from(file), event.authorId);

          this.broadcast('upload:success', {
            uploadId: event.uploadId,
            fileType: fileType,
            filePath: filePath,
            index,
            message: 'Success',
          });
        } else {
          throw new BadRequestException(`Unsupported file type: ${fileType}, path: ${filePath}`);
        }
        success++;
      } catch (error) {
        if (error instanceof ConflictException) {
          this.broadcast('upload:exists', {
            uploadId: event.uploadId,
            fileType: fileType,
            filePath: filePath,
            index,
            message: String('Already exists'),
          });
          duplicate++;
        } else {
          this.logger.error(`Failed to handle upload processed event for ${event.uploadId}:`, error);
          this.broadcast('upload:failed', {
            uploadId: event.uploadId,
            fileType: fileType,
            filePath: filePath,
            index,
            message: String(error),
          });
          fail++;
        }
      }
    }

    await this.prisma.gitHubUpload.update({
      where: { id: event.uploadId },
      data: {
        status: UploadStatus.COMPLETED,
        total,
        success,
        fail,
        duplicate,
      },
    });

    this.logger.log(
      `Upload ${event.uploadId} processed, total: ${total}, success: ${success}, fail: ${fail}, duplicate: ${duplicate}`,
    );
  }

  addUser(id: string, subject: Subject<MessageEvent>) {
    this.logger.log(`User ${id} connected`);
    this.users.set(id, { id, subject });

    subject.next({ data: this.data });
  }

  removeUser(id: string) {
    this.logger.log(`User ${id} disconnected`);
    this.users.delete(id);
  }

  broadcast<T extends UploadSSE['type']>(event: T, data: Extract<UploadSSE, { type: T }>['data']) {
    this.data = this.data.filter((item) => item.data.filePath !== data.filePath);
    this.data.push({ type: event, data });
    this.data = this.data.slice(-1000);

    for (const { subject } of this.users.values()) {
      subject.next({ data: { type: event, data } });
    }
  }

  /**
   * Ensure upload data folder exists
   */
  private async ensureUploadFolderExists(): Promise<void> {
    try {
      await fs.access(this.uploadDataFolder);
    } catch {
      await fs.mkdir(this.uploadDataFolder, { recursive: true });
      this.logger.log(`Created upload data folder: ${this.uploadDataFolder}`);
    }
  }

  /**
   * Extract owner and repo from GitHub URL
   */
  private parseGitHubUrl(githubUrl: string): { owner: string; repo: string } | null {
    const match = githubUrl.match(/https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)\/?$/);
    if (!match) return null;

    return {
      owner: match[1],
      repo: match[2],
    };
  }

  /**
   * Download repository as ZIP from GitHub
   */
  private async downloadRepository(owner: string, repo: string): Promise<Buffer> {
    try {
      const response = await this.octokitService.rest.repos.downloadZipballArchive({
        owner,
        repo,
        ref: 'main', // Default to main branch
      });

      return Buffer.from(response.data as ArrayBuffer);
    } catch (error) {
      // Try master branch if main fails
      try {
        const response = await this.octokitService.rest.repos.downloadZipballArchive({
          owner,
          repo,
          ref: 'master',
        });

        return Buffer.from(response.data as ArrayBuffer);
      } catch (masterError) {
        this.logger.error(`Failed to download repository ${owner}/${repo}:`, masterError);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        throw new Error(`Failed to download repository: ${error.message}`);
      }
    }
  }

  /**
   * Extract and filter .msch and .msav files from ZIP
   */
  private async extractMindustryFiles(zipBuffer: Buffer, uploadId: string): Promise<string[]> {
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();
    const extractedFiles: string[] = [];

    // Sort extracted entries by actual timestamp (oldest → newest)
    for (const entry of entries.sort((a, b) => a.header.time.getTime() - b.header.time.getTime())) {
      const fileName = entry.entryName;
      const isMindustryFile = fileName.endsWith('.msch') || fileName.endsWith('.msav');

      if (isMindustryFile && !entry.isDirectory) {
        try {
          const fileData = entry.getData();
          const sanitizedName = `${uploadId}_${fileName.replaceAll('/', '-')}`;
          const filePath = path.join(this.uploadDataFolder, sanitizedName);

          await fs.writeFile(filePath, fileData);

          extractedFiles.push(filePath);
        } catch (error) {
          this.logger.error(`Failed to extract file ${fileName}:`, error);
        }
      }
    }

    return extractedFiles;
  }

  /**
   * Process a single upload
   */
  async processUpload(upload: GitHubUpload): Promise<DownloadResult> {
    const uploadId = upload.id;

    try {
      // Update status to downloading
      await this.updateUploadStatus(uploadId, UploadStatus.DOWNLOADING);

      // Parse GitHub URL
      const parsed = this.parseGitHubUrl(upload.githubUrl);

      if (!parsed) {
        await this.updateUploadStatus(uploadId, UploadStatus.FAILED);
        return {
          success: false,
          uploadId,
          files: [],
        };
      }

      this.logger.log(`Processing upload ${uploadId}: ${parsed.owner}/${parsed.repo}`);

      // Download repository
      const zipBuffer = await this.downloadRepository(parsed.owner, parsed.repo);

      // Extract Mindustry files
      const extractedFiles = await this.extractMindustryFiles(zipBuffer, uploadId);

      this.logger.log(`Extracted ${extractedFiles.length} files from upload ${uploadId}`);

      if (extractedFiles.length === 0) {
        await this.updateUploadStatus(uploadId, UploadStatus.COMPLETED);

        this.logger.warn(`No Mindustry files found in repository ${parsed.owner}/${parsed.repo}`);

        return {
          success: true,
          uploadId,
          files: [],
        };
      }

      // Process the files directly in memory
      await this.handleUploadProcessed({
        authorId: upload.authorId,
        uploadId: uploadId,
        files: extractedFiles,
      });

      // Update status to processing
      await this.updateUploadStatus(uploadId, UploadStatus.PROCESSING);

      return {
        success: true,
        uploadId,
        files: extractedFiles,
      };
    } catch (error) {
      this.logger.error(`Failed to process upload ${uploadId}:`, error);

      try {
        await this.updateUploadStatus(uploadId, UploadStatus.FAILED);
      } catch (updateError) {
        this.logger.error(`Failed to update upload status to FAILED:`, updateError);
      }

      return {
        success: false,
        uploadId,
        files: [],
      };
    }
  }

  /**
   * Process all pending uploads
   */
  async processPendingUploads(): Promise<DownloadResult[]> {
    try {
      const pendingUploads = await this.getPendingUploads();
      const results: DownloadResult[] = [];

      for (const upload of pendingUploads) {
        const result = await this.processUpload(upload);
        results.push(result);
      }

      return results;
    } catch (error) {
      this.logger.error('Failed to process pending uploads:', error);
      return [];
    }
  }

  /**
   * Clean up old extracted files (optional maintenance method)
   */
  async cleanupOldFiles(maxAgeHours: number = 24): Promise<void> {
    try {
      const files = await fs.readdir(this.uploadDataFolder);
      const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.uploadDataFolder, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime.getTime() < cutoffTime) {
          await fs.unlink(filePath);
          this.logger.log(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old files:', error);
    }
  }
}

type ConnectedUser = {
  id: string;
  subject: Subject<MessageEvent>;
};

type UploadSSE =
  | {
      type: 'upload:success';
      data: UploadSSEData;
    }
  | {
      type: 'upload:exists';
      data: UploadSSEData;
    }
  | {
      type: 'upload:failed';
      data: UploadSSEData;
    };

type UploadSSEData = {
  uploadId: string;
  fileType: string;
  filePath: string;
  index: number;
  message: string;
};
