import { createUserSchema } from '@mindustry-tool/api';
import { createZodDto } from 'nestjs-zod';

export class CreateUserDto extends createZodDto(createUserSchema) {}
