import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '@/prisma/prisma.service';
import { MinioService } from '@/services/storage/minio.service';
import { NotFoundException } from '@nestjs/common';

describe('MediaService', () => {
  let service: MediaService;

  const mockPrisma = {
    media: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockMinio = {
    deleteImage: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MinioService, useValue: mockMinio },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
  });

  describe('delete', () => {
    const mediaId = '0192e987-6543-7890-abcd-ef0123456789';
    const mediaRecord = {
      id: mediaId,
      url: 'https://cdn.example.com/media/0192e987-6543-7890-abcd-ef0123456789/my_image.png',
      name: 'my_image.png',
      width: 100,
      height: 100,
      createdAt: new Date(),
      createdBy: '0192e000-0000-0000-0000-000000000000',
      mediaType: 'USER_CREATED',
    };

    it('should delete image from MinIO and remove database record', async () => {
      mockPrisma.media.findUnique.mockResolvedValue(mediaRecord);
      mockMinio.deleteImage.mockResolvedValue(undefined);
      mockPrisma.media.delete.mockResolvedValue(mediaRecord);

      await service.delete(mediaId);

      expect(mockPrisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: mediaId },
      });
      expect(mockMinio.deleteImage).toHaveBeenCalledWith(
        'media',
        '0192e987-6543-7890-abcd-ef0123456789/my_image',
        'png',
      );
      expect(mockPrisma.media.delete).toHaveBeenCalledWith({
        where: { id: mediaId },
      });
    });

    it('should throw NotFoundException when media is not found', async () => {
      mockPrisma.media.findUnique.mockResolvedValue(null);

      await expect(service.delete('missing-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockMinio.deleteImage).not.toHaveBeenCalled();
      expect(mockPrisma.media.delete).not.toHaveBeenCalled();
    });

    it('should fail and not delete database record if MinIO removal throws network or 500 error', async () => {
      mockPrisma.media.findUnique.mockResolvedValue(mediaRecord);
      mockMinio.deleteImage.mockRejectedValue(
        new Error('MinIO connection failed: 500 Internal Server Error'),
      );

      await expect(service.delete(mediaId)).rejects.toThrow(
        'MinIO connection failed: 500 Internal Server Error',
      );

      expect(mockMinio.deleteImage).toHaveBeenCalledWith(
        'media',
        '0192e987-6543-7890-abcd-ef0123456789/my_image',
        'png',
      );
      expect(mockPrisma.media.delete).not.toHaveBeenCalled();
    });
  });
});
