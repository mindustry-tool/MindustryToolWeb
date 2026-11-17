import { countSchematicSchema } from '@mindustry-tool/api';
import { createZodDto } from 'nestjs-zod';

export class CountSchematicQueryDto extends createZodDto(
  countSchematicSchema,
) {}
