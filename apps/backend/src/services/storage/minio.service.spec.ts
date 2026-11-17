import { Test, TestingModule } from '@nestjs/testing';
import { MinioService } from './minio.service';
import { ConfigService } from '@nestjs/config';
import { GatewayTimeoutException } from '@nestjs/common';

describe('MinioService Timeout Handling', () => {
  let minioService: MinioService;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      switch (key) {
        case 'minio.endPoint':
          return 'localhost';
        case 'minio.port':
          return 9000;
        case 'minio.useSSL':
          return false;
        case 'minio.accessKey':
          return 'testAccess';
        case 'minio.secretKey':
          return 'testSecret';
        case 'minio.publicUrl':
          return 'http://localhost:9000';
        default:
          return '';
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    minioService = module.get<MinioService>(MinioService);
  });

  it('resolves quickly if operation finishes within timeout', async () => {
    const fastOp = new Promise<string>((resolve) => setTimeout(() => resolve('success'), 10));
    const result = await minioService.withTimeout(fastOp, 500, 'FastOp');
    expect(result).toBe('success');
  });

  it('rejects with GatewayTimeoutException if operation takes longer than timeout', async () => {
    const slowOp = new Promise<string>((resolve) => setTimeout(() => resolve('too-late'), 300));
    await expect(minioService.withTimeout(slowOp, 50, 'SlowOp')).rejects.toThrow(
      GatewayTimeoutException,
    );
  });
});
