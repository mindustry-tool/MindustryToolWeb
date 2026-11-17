import { getUserBatchSchema } from '@mindustry-tool/api';
import { createZodDto } from 'nestjs-zod';

export class GetUserBatchDto extends createZodDto(getUserBatchSchema) {}
