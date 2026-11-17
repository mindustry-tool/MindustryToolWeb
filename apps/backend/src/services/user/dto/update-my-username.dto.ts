import { updateMyUsernameSchema } from '@mindustry-tool/api';
import { createZodDto } from 'nestjs-zod';

export class UpdateMyUsernameDto extends createZodDto(updateMyUsernameSchema) {}
