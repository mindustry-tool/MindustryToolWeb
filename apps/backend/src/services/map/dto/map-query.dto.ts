import { mapQuerySchema } from '@mindustry-tool/api';
import { createZodDto } from 'nestjs-zod';

export class MapQueryDto extends createZodDto(mapQuerySchema) {}
