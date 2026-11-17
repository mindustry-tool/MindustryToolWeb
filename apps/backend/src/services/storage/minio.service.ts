import { GatewayTimeoutException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { Readable } from 'stream';
import { buildMediaObjectName, detectUploadImage, toUploadMinioMetadata } from './image-upload.utils';

import http, { type ClientRequestArgs } from 'http';
import https from 'https';
import net from 'net';
import type { Duplex } from 'stream';

class HttpTimeoutAgent extends http.Agent {
  private readonly socketTimeoutMs: number;

  constructor(socketTimeoutMs: number, opts?: http.AgentOptions) {
    super(opts);
    this.socketTimeoutMs = socketTimeoutMs;
  }

  override createConnection(
    options: ClientRequestArgs,
    callback?: (err: Error | null, stream: Duplex) => void,
  ): Duplex | null | undefined {
    const socket = super.createConnection(options, callback);
    if (socket instanceof net.Socket) {
      socket.setTimeout(this.socketTimeoutMs);
      socket.once('timeout', () => {
        socket.destroy(new Error(`MinIO socket timed out after ${this.socketTimeoutMs}ms`));
      });
    }
    return socket;
  }
}

class HttpsTimeoutAgent extends https.Agent {
  private readonly socketTimeoutMs: number;

  constructor(socketTimeoutMs: number, opts?: https.AgentOptions) {
    super(opts);
    this.socketTimeoutMs = socketTimeoutMs;
  }

  override createConnection(
    options: ClientRequestArgs,
    callback?: (err: Error | null, stream: Duplex) => void,
  ): Duplex | null | undefined {
    const socket = super.createConnection(options, callback);
    if (socket instanceof net.Socket) {
      socket.setTimeout(this.socketTimeoutMs);
      socket.once('timeout', () => {
        socket.destroy(new Error(`MinIO socket timed out after ${this.socketTimeoutMs}ms`));
      });
    }
    return socket;
  }
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly minioClient: Minio.Client;
  private readonly logger = new Logger(MinioService.name);
  private readonly bucketName: string = 'mindustry-tool';
  private readonly publicUrl: string;
  private readonly defaultTimeoutMs = 30_000;

  constructor(private readonly configService: ConfigService) {
    const useSSL = this.configService.getOrThrow<boolean>('minio.useSSL') || false;
    const transportAgent: http.Agent = useSSL
      ? new HttpsTimeoutAgent(this.defaultTimeoutMs, { keepAlive: true })
      : new HttpTimeoutAgent(this.defaultTimeoutMs, { keepAlive: true });

    const accessKey = this.configService.getOrThrow<string>('minio.accessKey');
    const secretKey = this.configService.getOrThrow<string>('minio.secretKey');

    if (!accessKey) {
      throw new Error(`Invalid access key: <${accessKey}>`);
    }

    if (!secretKey) {
      throw new Error(`Invalid secret key: <${secretKey}>`);
    }

    this.minioClient = new Minio.Client({
      endPoint: this.configService.getOrThrow<string>('minio.endPoint') || 'minio',
      port: this.configService.getOrThrow<number>('minio.port') || 9000,
      useSSL,
      accessKey,
      secretKey,
      transportAgent,
    });
    this.publicUrl = configService.getOrThrow<string>('minio.publicUrl');
  }

  async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs = this.defaultTimeoutMs,
    operationName = 'Storage operation',
  ): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new GatewayTimeoutException(`${operationName} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  async ensureBucket() {
    try {
      const exists = await this.bucketExists(this.bucketName);
      if (!exists) {
        await this.makeBucket(this.bucketName);
        this.logger.log(`Bucket ${this.bucketName} created.`);
      }
    } catch (err) {
      this.logger.error(`Error checking/creating bucket: ${err}`);
    }
  }

  async getFileStream(objectName: string) {
    return this.getObject(this.bucketName, objectName);
  }

  async getObject(bucket: string, objectName: string) {
    try {
      return await this.withTimeout(
        this.minioClient.getObject(bucket, objectName),
        this.defaultTimeoutMs,
        `GetObject(${bucket}/${objectName})`,
      );
    } catch (err) {
      this.logger.error(`Error getting object: ${err}`);
      throw err;
    }
  }

  async statObject(bucket: string, objectName: string) {
    return this.withTimeout(
      this.minioClient.statObject(bucket, objectName),
      this.defaultTimeoutMs,
      `StatObject(${bucket}/${objectName})`,
    );
  }

  async putObject(
    bucket: string,
    objectName: string,
    buffer: string | Readable | Buffer<ArrayBufferLike>,
    bufferSize: number | undefined,
    metaData?: Minio.ItemBucketMetadata,
  ) {
    return this.withTimeout(
      this.minioClient.putObject(bucket, objectName, buffer, bufferSize, metaData),
      this.defaultTimeoutMs,
      `PutObject(${bucket}/${objectName})`,
    );
  }

  async bucketExists(bucket: string) {
    return this.withTimeout(this.minioClient.bucketExists(bucket), this.defaultTimeoutMs, `BucketExists(${bucket})`);
  }

  async makeBucket(bucket: string) {
    return this.withTimeout(this.minioClient.makeBucket(bucket), this.defaultTimeoutMs, `MakeBucket(${bucket})`);
  }

  async getPresignedUrl(objectName: string, expiry = 3600) {
    return this.withTimeout(
      this.minioClient.presignedGetObject(this.bucketName, objectName, expiry),
      this.defaultTimeoutMs,
      `PresignedGetObject(${objectName})`,
    );
  }

  async uploadFile(objectName: string, buffer: Buffer, metaData?: Minio.ItemBucketMetadata) {
    return this.putObject(this.bucketName, objectName, buffer, buffer.length, metaData);
  }

  async deleteFile(objectName: string) {
    return this.withTimeout(
      this.minioClient.removeObject(this.bucketName, objectName),
      this.defaultTimeoutMs,
      `RemoveObject(${this.bucketName}/${objectName})`,
    );
  }

  async createImage(buffer: Buffer, bucket: string, originalName: string): Promise<string> {
    const detection = detectUploadImage(buffer);
    const objectName = buildMediaObjectName(originalName, detection.extension);

    await this.putObject(bucket, objectName, buffer, buffer.length, toUploadMinioMetadata(detection));
    return `${this.publicUrl}/${bucket}/${objectName}`;
  }

  async deleteImage(bucket: string, id: string, format: string) {
    const objectName = `${id}.${format}`;
    await this.withTimeout(
      this.minioClient.removeObject(bucket, objectName),
      this.defaultTimeoutMs,
      `RemoveObject(${bucket}/${objectName})`,
    );
  }
}
