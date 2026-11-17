import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from '@nestjs/cache-manager';
import { ProfanityService } from './profanity.service';

describe('ProfanityService', () => {
  let service: ProfanityService;
  let mockCache: jest.Mocked<Pick<Cache, 'get' | 'set'>>;

  beforeEach(async () => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfanityService,
        { provide: Cache, useValue: mockCache },
      ],
    }).compile();

    service = module.get<ProfanityService>(ProfanityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sanitizeText caching behavior', () => {
    it('should be a cache miss on first call and execute profanity', async () => {
      mockCache.get.mockResolvedValue(undefined);

      const result = await service.sanitizeText('hello');

      expect(mockCache.get).toHaveBeenCalledWith(expect.stringContaining('profanity:sanitize:'));
      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('profanity:sanitize:'),
        { value: 'hello', filtered: false },
        300_000,
      );
      expect(result).toEqual({ value: 'hello', filtered: false });
    });

    it('should return cached result on second call with same value', async () => {
      const cachedResult = { value: 'hello', filtered: false };
      mockCache.get.mockResolvedValue(cachedResult);

      const result = await service.sanitizeText('hello');

      expect(mockCache.get).toHaveBeenCalledWith(expect.stringContaining('profanity:sanitize:'));
      expect(mockCache.set).not.toHaveBeenCalled();
      expect(result).toBe(cachedResult);
    });

    it('should produce independent cache entries for different inputs', async () => {
      mockCache.get.mockResolvedValue(undefined);

      await service.sanitizeText('hello');
      await service.sanitizeText('world');

      const calls = mockCache.set.mock.calls;
      const key1 = calls[0][0];
      const key2 = calls[1][0];
      expect(key1).not.toBe(key2);
    });

    it('should re-execute profanity after cache expiry', async () => {
      mockCache.get
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      await service.sanitizeText('hello');
      await service.sanitizeText('hello');

      expect(mockCache.set).toHaveBeenCalledTimes(2);
    });
  });

  describe('sanitizeText filtering correctness', () => {
    it('should filter out standard profanity words', async () => {
      mockCache.get.mockResolvedValue(undefined);

      const result = await service.sanitizeText('fuck this shit');

      expect(result.filtered).toBe(true);
      expect(result.value).not.toContain('fuck');
      expect(result.value).not.toContain('shit');
    });

    it('should pass clean text through unchanged', async () => {
      mockCache.get.mockResolvedValue(undefined);

      const result = await service.sanitizeText('hello world');

      expect(result.filtered).toBe(false);
      expect(result.value).toBe('hello world');
    });

    it('should filter extended profanity list words', async () => {
      mockCache.get.mockResolvedValue(undefined);

      const result = await service.sanitizeText('you are an asshole');

      expect(result.filtered).toBe(true);
      expect(result.value).not.toContain('asshole');
    });

    it('should filter multiple custom words from extended list', async () => {
      mockCache.get.mockResolvedValue(undefined);

      const [result1, result2] = await Promise.all([
        service.sanitizeText('motherfucker'),
        service.sanitizeText('hitler'),
      ]);

      expect(result1.filtered).toBe(true);
      expect(result1.value).not.toContain('motherfucker');
      expect(result2.filtered).toBe(true);
      expect(result2.value).not.toContain('hitler');
    });
  });

  describe('cache key derivation', () => {
    it('should use the correct key prefix', async () => {
      mockCache.get.mockResolvedValue(undefined);

      await service.sanitizeText('test');

      expect(mockCache.get).toHaveBeenCalledWith(expect.stringMatching(/^profanity:sanitize:/));
    });

    it('should produce deterministic keys for same input', async () => {
      mockCache.get.mockResolvedValue(undefined);

      await service.sanitizeText('test');
      await service.sanitizeText('test');

      const key1 = mockCache.get.mock.calls[0][0];
      const key2 = mockCache.get.mock.calls[1][0];
      expect(key1).toBe(key2);
    });

    it('should produce different keys for different inputs', async () => {
      mockCache.get.mockResolvedValue(undefined);

      await service.sanitizeText('aaa');
      await service.sanitizeText('bbb');

      const key1 = mockCache.get.mock.calls[0][0];
      const key2 = mockCache.get.mock.calls[1][0];
      expect(key1).not.toBe(key2);
    });
  });
});
