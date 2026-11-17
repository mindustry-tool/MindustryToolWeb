import { PluginService } from '@/services/plugin/plugin.service';
import { CreateFileDto } from '@/services/server/dto/create-file.dto';
import { api } from '@mindustry-tool/api';
import { ApiBody } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';
import { Response } from 'express';
import { BadRequestException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { ServerAuthorityService } from './server-authority.service';
import { ManagerRpcClient } from '../manager-gateway/server-manager-rpc.service';
import { fileDescriptors } from '../manager-gateway/descriptors/files.descriptors';
import { fileTypeFromBuffer } from 'file-type';

@Injectable()
export class ServerFileService {
  private static readonly DOWNLOAD_TIMEOUT_MS = 120_000;
  private readonly logger = new Logger(ServerFileService.name);
  private readonly inFlightModDownloads = new Map<string, Promise<Buffer<ArrayBuffer>>>();

  constructor(
    private readonly serverAuthorityService: ServerAuthorityService,
    private readonly pluginService: PluginService,
    private readonly managerRpcClient: ManagerRpcClient,
  ) {}

  async downloadModRelease(
    owner: string,
    repo: string,
    tag: string,
    releaseId: string | number,
    cacheModFile: string,
    pluginName: string,
  ): Promise<Buffer<ArrayBuffer>> {
    const downloadKey = `${pluginName}/${String(releaseId)}`;
    const existing = this.inFlightModDownloads.get(downloadKey);

    if (existing) {
      await existing;
      return await fs.promises.readFile(cacheModFile);
    }

    const promise = (async (): Promise<Buffer<ArrayBuffer>> => {
      const r = await this.pluginService.downloadBuffer(owner, repo, tag);
      const buf = r.buffer;

      const dir = path.dirname(cacheModFile);
      await fs.promises.mkdir(dir, { recursive: true });

      const files = await fs.promises.readdir(dir);
      await Promise.all(files.map((file) => fs.promises.unlink(path.join(dir, file))));

      await fs.promises.writeFile(cacheModFile, buf);

      return buf;
    })();

    this.inFlightModDownloads.set(downloadKey, promise);

    try {
      return await promise;
    } finally {
      this.inFlightModDownloads.delete(downloadKey);
    }
  }

  async installFile(id: string, body: ApiBody<typeof api.v4.servers.files.install>, user: Session) {
    const { url, path: filePath } = body;

    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:map', 'server:mod', 'server:file', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    const file = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/octet-stream',
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!file.ok) {
      throw new BadRequestException('Failed to download file');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await this.managerRpcClient.sendStream(server.managerId, fileDescriptors.fileUpload, { serverId: id, path: filePath }, buffer);
  }

  private async assertFileAccess(user: Session | null, serverId: string, createdBy: string) {
    if (!user) {
      throw new UnauthorizedException('You are not logged in, please login first');
    }

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, serverId, {
        any: ['server:manage', 'server:file', { authorId: createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }
  }

  async listFiles(id: string, filePath: string, res: Response, user: Session | null) {
    const server = await this.serverAuthorityService.getServerCached(id);
    const isThumbnail = filePath.endsWith('.png') && !filePath.includes('..');

    if (!isThumbnail) {
      await this.assertFileAccess(user, id, server.createdBy);
    }

    const data = await this.managerRpcClient.sendRequest(server.managerId, fileDescriptors.getFiles, {
      serverId: id,
      path: filePath,
    });

    if (typeof data !== 'string') {
      if (isThumbnail) {
        await this.assertFileAccess(user, id, server.createdBy);
      }
      res.json(data);
      return;
    }

    const buffer = Buffer.from(data, 'base64');
    const detected = await fileTypeFromBuffer(buffer);

    if (detected) {
      res.type(detected.mime);

      if (detected.mime.startsWith('image/')) {
        res.set('Cache-Control', 'public, max-age=86400');
      }
    }

    res.send(buffer);
  }

  async createFolder(id: string, filePath: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:file', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    await this.managerRpcClient.sendRequest(server.managerId, fileDescriptors.createFolder, { serverId: id, path: filePath });
  }

  async writeFile(id: string, filePath: string, body: CreateFileDto, user: Session) {
    const { data } = body;

    const server = await this.serverAuthorityService.getServerCached(id);
    const isMapFile = filePath.startsWith('maps/');

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: isMapFile
          ? ['server:manage', 'server:file', 'server:map', { authorId: server.createdBy }]
          : ['server:manage', 'server:file', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    const fileBuffer = data ? Buffer.from(data.buffer) : Buffer.alloc(0);

    await this.managerRpcClient.sendStream(server.managerId, fileDescriptors.fileUpload, { serverId: id, path: filePath }, fileBuffer);
  }

  async downloadFile(id: string, filePath: string, res: Response, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:file', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    const buffer = await this.downloadServerFile(server.managerId, id, filePath);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    res.send(buffer);
  }

  async deleteFile(id: string, filePath: string, user: Session) {
    const server = await this.serverAuthorityService.getServerCached(id);

    if (
      !(await this.serverAuthorityService.hasServerAccess(user, id, {
        any: ['server:manage', 'server:file', 'server:map', 'server:mod', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    await this.managerRpcClient.sendRequest(server.managerId, fileDescriptors.deleteFile, { serverId: id, path: filePath });
  }

  async getAllMaps(id: string) {
    const server = await this.serverAuthorityService.getServerCached(id);

    return await this.managerRpcClient.sendRequest(server.managerId, fileDescriptors.getMaps, { serverId: id });
  }

  async getAllMods(id: string) {
    const server = await this.serverAuthorityService.getServerCached(id);

    return await this.managerRpcClient.sendRequest(server.managerId, fileDescriptors.getMods, { serverId: id });
  }

  private async downloadServerFile(managerId: string, serverId: string, filePath: string): Promise<Buffer> {
    const res = await this.managerRpcClient.sendRequest(
      managerId,
      fileDescriptors.downloadFile,
      { serverId, path: filePath },
      ServerFileService.DOWNLOAD_TIMEOUT_MS,
    );

    if (!Buffer.isBuffer(res)) {
      throw new Error('Manager did not answer download-file with a stream');
    }
    return res;
  }
}
