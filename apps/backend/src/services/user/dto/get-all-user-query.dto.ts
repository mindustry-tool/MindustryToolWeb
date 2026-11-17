import { queryAllUserSchema } from '@mindustry-tool/api';
import { createZodDto } from 'nestjs-zod';

export class GetAllUserQueryDto extends createZodDto(queryAllUserSchema) {}
