import { updateUserSchema } from '@mindustry-tool/api';
import { createZodDto } from 'nestjs-zod';

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
