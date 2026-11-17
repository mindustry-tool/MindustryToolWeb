import { TransformOptionsDto } from '@/services/image-proxy/dto/transform-options.dto';
import { paginationQuerySchema, previewImageQuerySchema } from '@mindustry-tool/api';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/mini';

export class PaginationQuery extends createZodDto(paginationQuerySchema) {}

export class PreviewImageQuery {
  variant?: 'preview';
  format?: z.infer<typeof previewImageQuerySchema>['format'];

  constructor({
    variant,
    format,
  }: {
    variant?: 'preview';
    format?: z.infer<typeof previewImageQuerySchema>['format'];
  }) {
    this.variant = variant;
    this.format = format;
  }

  toTransform() {
    if (!this.variant && !this.format) {
      return new TransformOptionsDto({});
    }

    const transformOptions = new TransformOptionsDto({});

    if (this.variant) {
      transformOptions.width = 384;
      transformOptions.height = 384;
      transformOptions.format = this.format ?? 'png';
    } else if (this.format) {
      transformOptions.format = this.format;
    }

    return transformOptions;
  }
}
