import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { TransformOptionsDto } from './dto/transform-options.dto';
import { MinioService } from '@/services/storage/minio.service';
import { PassThrough, Readable } from 'stream';
import { S3Error } from 'minio';
import PQueue from 'p-queue';

export const PUBLIC_BUCKETS = ['schematics', 'maps', 'media'] as const;
export const CACHE_BUCKET = 'image-cache';

export type PublicBucket = (typeof PUBLIC_BUCKETS)[number];
type ImageFormat = 'png' | 'jpeg' | 'webp';
type StoredImageMetadata = {
  format: ImageFormat;
  contentType: string;
  mimeType: string;
};

@Injectable()
export class ImageProxyService {
  private readonly logger = new Logger(ImageProxyService.name);
  private readonly inflight = new Map<string, Promise<{ buffer: Buffer; metadata: StoredImageMetadata }>>();
  private readonly transformInflight = new Map<string, Promise<{ buffer: Buffer; contentType: string }>>();
  private readonly providerQueue = new PQueue({ concurrency: 8 });
  private readonly transformQueue = new PQueue({ concurrency: 1 });

  constructor(private readonly minioService: MinioService) {}

  async getImage(
    bucket: string,
    path: string,
    options: TransformOptionsDto,
    provider?: () => Promise<Buffer>,
  ): Promise<{ stream: Readable; contentType: string }> {
    this.validateBucket(bucket);

    if (!options.needTransform()) {
      return this.getOriginalStream(bucket, path, provider);
    }

    const explicitFormat = this.normalizeFormat(options.format);
    if (explicitFormat) {
      const directCacheKey = this.generateCacheKey(bucket, path, options, explicitFormat);
      const cached = await this.getCacheStream(directCacheKey);
      if (cached) return cached;

      const inFlight = this.transformInflight.get(directCacheKey);
      if (inFlight) {
        const result = await inFlight;
        return {
          stream: this.bufferToStream(result.buffer),
          contentType: result.contentType,
        };
      }

      const transformPromise = this.executeTransform(
        bucket,
        path,
        options,
        directCacheKey,
        this.getFormatMetadata(explicitFormat),
        provider,
      ).finally(() => {
        this.transformInflight.delete(directCacheKey);
      });

      this.transformInflight.set(directCacheKey, transformPromise);

      const result = await transformPromise;
      return {
        stream: this.bufferToStream(result.buffer),
        contentType: result.contentType,
      };
    }

    const inFlightKey = `${bucket}/${path}_${options.width || ''}x${options.height || ''}`;
    const inFlight = this.transformInflight.get(inFlightKey);
    if (inFlight) {
      const result = await inFlight;
      return {
        stream: this.bufferToStream(result.buffer),
        contentType: result.contentType,
      };
    }

    const transformPromise = this.transformQueue
      .add(async () => {
        const original = await this.getOriginalStream(bucket, path, provider);
        const outputMetadata = this.getOutputMetadata(original, options);
        const cacheKey = this.generateCacheKey(bucket, path, options, outputMetadata.format);

        const cached = await this.getCacheStream(cacheKey);
        if (cached) {
          const buffer = await this.streamToBuffer(cached.stream);
          return { buffer, contentType: cached.contentType };
        }

        return await this.performTransform(bucket, path, options, original, outputMetadata, cacheKey);
      })
      .finally(() => {
        this.transformInflight.delete(inFlightKey);
      });

    this.transformInflight.set(inFlightKey, transformPromise);

    const result = await transformPromise;

    return {
      stream: this.bufferToStream(result.buffer),
      contentType: result.contentType,
    };
  }

  private async executeTransform(
    bucket: string,
    path: string,
    options: TransformOptionsDto,
    cacheKey: string,
    outputMetadata: StoredImageMetadata,
    provider?: () => Promise<Buffer>,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    return await this.transformQueue.add(async () => {
      const original = await this.getOriginalStream(bucket, path, provider);
      return await this.performTransform(bucket, path, options, original, outputMetadata, cacheKey);
    });
  }

  private async performTransform(
    bucket: string,
    path: string,
    options: TransformOptionsDto,
    original: { stream: Readable } & StoredImageMetadata,
    outputMetadata: StoredImageMetadata,
    cacheKey: string,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    this.logger.log(`Transforming ${bucket}/${path} with options ${JSON.stringify(options)}`);

    const transformer = sharp();

    if (options.width !== undefined || options.height !== undefined) {
      transformer.resize({
        width: options.width,
        height: options.height,
        fit: 'inside',
        withoutEnlargement: true,
        fastShrinkOnLoad: true,
      });
    }

    if (outputMetadata.format === 'webp') {
      transformer.webp({ quality: 80, effort: 3 });
    } else if (outputMetadata.format === 'jpeg') {
      transformer.jpeg({ quality: 80 });
    } else {
      transformer.png({ compressionLevel: 6, adaptiveFiltering: false, effort: 1 });
    }

    original.stream.on('error', (err) => {
      transformer.destroy(err);
    });

    const buffer = await original.stream.pipe(transformer).toBuffer();

    await this.saveToCache(cacheKey, buffer, outputMetadata);

    return {
      buffer,
      contentType: outputMetadata.contentType,
    };
  }

  private async getOriginalStream(
    bucket: string,
    path: string,
    provider?: () => Promise<Buffer>,
  ): Promise<{ stream: Readable } & StoredImageMetadata> {
    try {
      return await this.getObjectWithMetadata(bucket, path);
    } catch (err) {
      if (!this.isS3NotFound(err)) throw err;

      if (!provider) {
        throw new NotFoundException('Object not found');
      }

      const { buffer, metadata } = await this.resolveAndStoreOriginal(`${bucket}/${path}`, bucket, path, provider);

      return {
        stream: this.bufferToStream(buffer),
        ...metadata,
      };
    }
  }

  private async getCacheStream(key: string): Promise<({ stream: Readable } & StoredImageMetadata) | null> {
    try {
      const cached = await this.getObjectWithMetadata(CACHE_BUCKET, key);
      this.logger.debug(`Cache hit: ${key}`);
      return cached;
    } catch (err) {
      if (!this.isS3NotFound(err)) throw err;
      return null;
    }
  }

  private async saveToCache(key: string, buffer: Buffer, metadata: StoredImageMetadata) {
    try {
      await this.minioService.putObject(CACHE_BUCKET, key, buffer, buffer.length, this.toMinioMetadata(metadata));
      this.logger.debug(`Cached: ${key}`);
    } catch (error) {
      this.logger.warn(`Cache failed: ${error}`);
    }
  }

  private async resolveAndStoreOriginal(
    key: string,
    bucket: string,
    path: string,
    provider: () => Promise<Buffer>,
  ): Promise<{ buffer: Buffer; metadata: StoredImageMetadata }> {
    const existing = this.inflight.get(key);
    if (existing) {
      return existing;
    }

    const promise = this.providerQueue
      .add(async () => {
        this.logger.debug(
          `Generating image for ${key} (Queue size: ${this.providerQueue.size}, pending: ${this.providerQueue.pending})`,
        );
        const buffer = await provider();
        const metadata = await this.resolveImageMetadata(buffer);
        await this.putIfNotExists(bucket, path, buffer, metadata);
        return { buffer, metadata };
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise;
  }

  private validateBucket(bucket: string): asserts bucket is PublicBucket {
    if (!PUBLIC_BUCKETS.includes(bucket as PublicBucket)) {
      throw new BadRequestException(`Invalid bucket`);
    }
  }

  private generateCacheKey(bucket: string, path: string, options: TransformOptionsDto, format: ImageFormat): string {
    const size = `${options.width || ''}x${options.height || ''}`;

    return `${bucket}/${path}_${size}.${format}`;
  }

  private bufferToStream(buffer: Buffer): Readable {
    const stream = new PassThrough();
    stream.end(buffer);
    return stream;
  }

  private async getObjectWithMetadata(
    bucket: string,
    key: string,
  ): Promise<{ stream: Readable } & StoredImageMetadata> {
    const stat = await this.minioService.statObject(bucket, key);
    const metadata = this.readStoredMetadata(stat?.metaData);
    const hasFullMetadata = this.hasStoredImageMetadata(stat?.metaData);

    if (metadata && hasFullMetadata) {
      const stream = await this.minioService.getObject(bucket, key);

      return {
        stream,
        ...metadata,
      };
    }

    const buffer = await this.readObjectBuffer(bucket, key);
    const repairedMetadata = metadata ?? (await this.resolveImageMetadata(buffer));

    return {
      stream: this.bufferToStream(buffer),
      ...repairedMetadata,
    };
  }

  private async readObjectBuffer(bucket: string, key: string): Promise<Buffer> {
    const stream = await this.minioService.getObject(bucket, key);
    return this.streamToBuffer(stream);
  }

  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
  }

  private async resolveImageMetadata(buffer: Buffer): Promise<StoredImageMetadata> {
    const detected = await this.detectWithFileType(buffer);
    if (detected) return detected;
    return this.getFormatMetadata('png');
  }

  private async detectWithFileType(buffer: Buffer): Promise<StoredImageMetadata | null> {
    try {
      const detected = await fileTypeFromBuffer(buffer);
      const format = this.normalizeFormat(detected?.ext, detected?.mime);

      if (!format) return null;

      const metadata = this.getFormatMetadata(format);

      if (!detected?.mime) return metadata;

      return {
        ...metadata,
        contentType: detected.mime,
        mimeType: detected.mime,
      };
    } catch (err) {
      this.logger.warn(`File type detect failed: ${err}`);
      return null;
    }
  }

  private getOutputMetadata(source: StoredImageMetadata, options: TransformOptionsDto): StoredImageMetadata {
    const format = this.normalizeFormat(options.format) ?? source.format;
    return this.getFormatMetadata(format);
  }

  private getFormatMetadata(format: ImageFormat): StoredImageMetadata {
    switch (format) {
      case 'jpeg':
        return {
          format: 'jpeg',
          contentType: 'image/jpeg',
          mimeType: 'image/jpeg',
        };
      case 'webp':
        return {
          format: 'webp',
          contentType: 'image/webp',
          mimeType: 'image/webp',
        };
      default:
        return {
          format: 'png',
          contentType: 'image/png',
          mimeType: 'image/png',
        };
    }
  }

  private normalizeFormat(value?: string, mimeType?: string): ImageFormat | null {
    const normalizedValue = value?.toLowerCase();
    const normalizedMimeType = mimeType?.toLowerCase();

    if (normalizedValue === 'jpg' || normalizedValue === 'jpeg') return 'jpeg';
    if (normalizedValue === 'png') return 'png';
    if (normalizedValue === 'webp') return 'webp';

    if (normalizedMimeType === 'image/jpeg') return 'jpeg';
    if (normalizedMimeType === 'image/png') return 'png';
    if (normalizedMimeType === 'image/webp') return 'webp';

    return null;
  }

  private readStoredMetadata(metaData?: Record<string, unknown>): StoredImageMetadata | null {
    const contentType =
      this.getMetadataValue(
        metaData,
        'content-type',
        'Content-Type',
        'x-amz-meta-content-type',
        'mime-type',
        'x-amz-meta-mime-type',
      ) ?? undefined;
    const mimeType =
      this.getMetadataValue(
        metaData,
        'x-amz-meta-mime-type',
        'mime-type',
        'content-type',
        'Content-Type',
        'x-amz-meta-content-type',
      ) ?? contentType;
    const format =
      this.normalizeFormat(
        this.getMetadataValue(metaData, 'x-amz-meta-format', 'format') ?? undefined,
        mimeType ?? contentType,
      ) ?? this.normalizeFormat(undefined, contentType);

    if (!contentType || !mimeType || !format) return null;

    return {
      format,
      contentType,
      mimeType,
    };
  }

  private hasStoredImageMetadata(metaData?: Record<string, unknown>): boolean {
    return Boolean(
      this.getMetadataValue(metaData, 'x-amz-meta-content-type') &&
      this.getMetadataValue(metaData, 'x-amz-meta-mime-type'),
    );
  }

  private getMetadataValue(metaData: Record<string, unknown> | undefined, ...keys: string[]): string | null {
    if (!metaData) return null;

    const entries = Object.entries(metaData).reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key.toLowerCase()] = value;
      }

      return acc;
    }, {});

    for (const key of keys) {
      const value = entries[key.toLowerCase()];
      if (value) return value;
    }

    return null;
  }

  private toMinioMetadata(metadata: StoredImageMetadata): Record<string, string> {
    return {
      'Content-Type': metadata.contentType,
      'X-Amz-Meta-Content-Type': metadata.contentType,
      'X-Amz-Meta-Mime-Type': metadata.mimeType,
      'X-Amz-Meta-Format': metadata.format,
    };
  }

  private async putIfNotExists(bucket: string, key: string, buffer: Buffer, metadata: StoredImageMetadata) {
    try {
      await this.minioService.statObject(bucket, key);
      return;
    } catch (err) {
      if (!this.isS3NotFound(err)) throw err;
    }

    try {
      await this.minioService.putObject(bucket, key, buffer, buffer.length, this.toMinioMetadata(metadata));

      this.logger.debug(`Stored original: ${key}`);
    } catch (err) {
      this.logger.warn(`Store original failed: ${err}`);
    }
  }

  async ensureBuckets(): Promise<void> {
    try {
      const exists = await this.minioService.bucketExists(CACHE_BUCKET);
      if (!exists) {
        await this.minioService.makeBucket(CACHE_BUCKET);
        this.logger.log(`Created cache bucket: ${CACHE_BUCKET}`);
      }

      for (const bucket of PUBLIC_BUCKETS) {
        const exists = await this.minioService.bucketExists(bucket);
        if (!exists) {
          await this.minioService.makeBucket(bucket);
          this.logger.log(`Created bucket: ${bucket}`);
        }
      }
    } catch (err) {
      this.logger.error(`Error checking/creating cache bucket: ${err}`);
    }
  }

  isS3NotFound(err: unknown): boolean {
    if (!err) return false;
    if (err instanceof S3Error) {
      return err.code === 'NoSuchKey' || err.code === 'NotFound';
    }
    if (typeof err === 'object' && err !== null && 'code' in err) {
      const code = (err as { code?: unknown }).code;
      return code === 'NoSuchKey' || code === 'NotFound';
    }

    return false;
  }
}
