import { PreviewImageQuery } from '@/types/query.types';
import { ImageProxyService } from './image-proxy.service';
import { MinioService } from '@/services/storage/minio.service';
import { TransformOptionsDto } from './dto/transform-options.dto';
import { PassThrough } from 'stream';

describe('PreviewImageQuery', () => {
  it('defaults format to png when variant is preview', () => {
    const query = new PreviewImageQuery({ variant: 'preview' });
    const options = query.toTransform();

    expect(options.width).toBe(384);
    expect(options.height).toBe(384);
    expect(options.format).toBe('png');
  });

  it('preserves explicitly specified format when variant is preview', () => {
    const query = new PreviewImageQuery({ variant: 'preview', format: 'png' });
    const options = query.toTransform();

    expect(options.width).toBe(384);
    expect(options.height).toBe(384);
    expect(options.format).toBe('png');
  });

  it('returns empty transform options when neither variant nor format is provided', () => {
    const query = new PreviewImageQuery({});
    const options = query.toTransform();

    expect(options.needTransform()).toBe(false);
  });
});

describe('ImageProxyService Fast-Path Cache & Concurrency', () => {
  let service: ImageProxyService;
  let mockMinio: {
    statObject: jest.Mock;
    getObject: jest.Mock;
    putObject: jest.Mock;
    bucketExists: jest.Mock;
    makeBucket: jest.Mock;
  };

  const createStream = (content: string) => {
    const stream = new PassThrough();
    stream.end(Buffer.from(content));
    return stream;
  };

  beforeEach(() => {
    mockMinio = {
      statObject: jest.fn(),
      getObject: jest.fn(),
      putObject: jest.fn().mockResolvedValue({ etag: 'test-etag' }),
      bucketExists: jest.fn().mockResolvedValue(true),
      makeBucket: jest.fn().mockResolvedValue(undefined),
    };

    service = new ImageProxyService(mockMinio as unknown as MinioService);
  });

  it('resolves directly from cache when explicit format is provided without reading original', async () => {
    const options = new TransformOptionsDto({
      width: 384,
      height: 384,
      format: 'webp',
    });

    mockMinio.statObject.mockImplementation((bucket: string, key: string) => {
      if (bucket === 'image-cache') {
        return Promise.resolve({
          metaData: {
            'content-type': 'image/webp',
            'x-amz-meta-content-type': 'image/webp',
            'x-amz-meta-mime-type': 'image/webp',
            'x-amz-meta-format': 'webp',
          },
        });
      }
      return Promise.reject(new Error('Should not call original stat'));
    });

    mockMinio.getObject.mockImplementation((bucket: string, key: string) => {
      if (bucket === 'image-cache') {
        return Promise.resolve(createStream('cached-webp-data'));
      }
      return Promise.reject(new Error('Should not call original getObject'));
    });

    const result = await service.getImage('schematics', 'test-id', options);

    expect(result.contentType).toBe('image/webp');
    expect(mockMinio.statObject).toHaveBeenCalledWith('image-cache', 'schematics/test-id_384x384.webp');
    // Original schematics bucket should NOT have been queried
    expect(mockMinio.statObject).not.toHaveBeenCalledWith('schematics', 'test-id');
    expect(mockMinio.getObject).not.toHaveBeenCalledWith('schematics', 'test-id');
  });

  it('returns original stream directly when transformation is not needed', async () => {
    const options = new TransformOptionsDto({});

    mockMinio.statObject.mockResolvedValue({
      metaData: {
        'content-type': 'image/png',
        'x-amz-meta-content-type': 'image/png',
        'x-amz-meta-mime-type': 'image/png',
        'x-amz-meta-format': 'png',
      },
    });
    mockMinio.getObject.mockResolvedValue(createStream('original-png-data'));

    const result = await service.getImage('schematics', 'test-id', options);

    expect(result.contentType).toBe('image/png');
    expect(mockMinio.statObject).toHaveBeenCalledWith('schematics', 'test-id');
  });
});
