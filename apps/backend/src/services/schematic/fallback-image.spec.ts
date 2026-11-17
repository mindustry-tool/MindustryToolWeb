import { ApiError } from '@mindustry-tool/api';
import { getFallbackPreviewImage } from '@/utils/fallback-image.utils';
import { SchematicService } from './schematics.service';
import { MapService } from '@/services/map/map.service';

import { ContentParserService } from '@/services/content-parser/content-parser.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ItemService } from '@/services/item/item.service';
import { PrometheusService } from '@/services/prometheus/prometheus.service';
import { ImageProxyService } from '@/services/image-proxy/image-proxy.service';
import { VerifyService } from '@/services/verify/verify.service';
import { Cache } from '@nestjs/cache-manager';

describe('Fallback Preview Image on 400', () => {
  it('loads valid fallback image buffer from getFallbackPreviewImage', async () => {
    const fallbackBuffer = await getFallbackPreviewImage();
    expect(fallbackBuffer).toBeDefined();
    expect(Buffer.isBuffer(fallbackBuffer)).toBe(true);
    expect(fallbackBuffer.length).toBeGreaterThan(0);
  });

  describe('SchematicService.generateImage', () => {
    let service: SchematicService;
    let mockPrisma: { schematic: { findUniqueOrThrow: jest.Mock } };
    let mockContentParser: { apiInstance: { request: jest.Mock } };

    beforeEach(() => {
      mockPrisma = {
        schematic: {
          findUniqueOrThrow: jest.fn().mockResolvedValue({
            data: Buffer.from('test-schematic-data'),
          }),
        },
      };
      mockContentParser = {
        apiInstance: {
          request: jest.fn(),
        },
      };

      service = new SchematicService(
        mockContentParser as unknown as ContentParserService,
        mockPrisma as unknown as PrismaService,
        {} as unknown as ItemService,
        {} as unknown as Cache,
        {} as unknown as PrometheusService,
        {} as unknown as ImageProxyService,
        {} as unknown as VerifyService,
      );
    });

    it('returns fallback buffer when content parser returns status 400', async () => {
      const apiError = new ApiError({
        message: 'Invalid schematic format',
        status: 400,
        statusText: 'Bad Request',
        url: 'http://parser/api/schematics/image',
      });
      mockContentParser.apiInstance.request.mockRejectedValue(apiError);

      const result = await service.generateImage('test-id');
      const expectedFallback = await getFallbackPreviewImage();

      expect(result).toEqual(expectedFallback);
    });

    it('rethrows non-400 errors from content parser', async () => {
      const apiError = new ApiError({
        message: 'Internal server error',
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://parser/api/schematics/image',
      });
      mockContentParser.apiInstance.request.mockRejectedValue(apiError);

      await expect(service.generateImage('test-id')).rejects.toThrow(apiError);
    });
  });

  describe('MapService.generateImage', () => {
    let service: MapService;
    let mockPrisma: { map: { findUniqueOrThrow: jest.Mock } };
    let mockContentParser: { apiInstance: { request: jest.Mock } };

    beforeEach(() => {
      mockPrisma = {
        map: {
          findUniqueOrThrow: jest.fn().mockResolvedValue({
            data: Buffer.from('test-map-data'),
          }),
        },
      };
      mockContentParser = {
        apiInstance: {
          request: jest.fn(),
        },
      };

      service = new MapService(
        mockContentParser as unknown as ContentParserService,
        mockPrisma as unknown as PrismaService,
        {} as unknown as ItemService,
        {} as unknown as Cache,
        {} as unknown as PrometheusService,
        {} as unknown as ImageProxyService,
        {} as unknown as VerifyService,
      );
    });

    it('returns fallback buffer when content parser returns status 400', async () => {
      const apiError = new ApiError({
        message: 'Invalid map format',
        status: 400,
        statusText: 'Bad Request',
        url: 'http://parser/api/maps/image',
      });
      mockContentParser.apiInstance.request.mockRejectedValue(apiError);

      const result = await service.generateImage('test-id');
      const expectedFallback = await getFallbackPreviewImage();

      expect(result).toEqual(expectedFallback);
    });

    it('rethrows non-400 errors from content parser', async () => {
      const apiError = new ApiError({
        message: 'Service unavailable',
        status: 503,
        statusText: 'Service Unavailable',
        url: 'http://parser/api/maps/image',
      });
      mockContentParser.apiInstance.request.mockRejectedValue(apiError);

      await expect(service.generateImage('test-id')).rejects.toThrow(apiError);
    });
  });
});
