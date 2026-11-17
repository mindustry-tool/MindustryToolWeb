import { countMapSchema } from '@mindustry-tool/api';
import { createZodDto } from 'nestjs-zod';

export class CountMapQueryDto extends createZodDto(countMapSchema) {}
