import { schematicQuerySchema } from '@mindustry-tool/api';
import { createZodDto } from 'nestjs-zod';

export class SchematicQueryDto extends createZodDto(schematicQuerySchema) {}
