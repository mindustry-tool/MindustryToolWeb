import { userQuerySchema } from '@mindustry-tool/api';
import { createZodDto } from 'nestjs-zod';

export class UserQueryDto extends createZodDto(userQuerySchema) {}
