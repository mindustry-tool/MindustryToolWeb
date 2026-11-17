import { IsOptional, IsUUID } from 'class-validator';
import { IsFiles, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';

export class CreateImageDto {
  @IsFiles()
  @MaxFileSize(3e6, { each: true })
  data: MemoryStoredFile[];

  @IsUUID()
  @IsOptional()
  parentId: string;
}
