import { IsOptional } from 'class-validator';
import { IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';

export class CreateFileDto {
  @IsOptional()
  @IsFile()
  @MaxFileSize(3e7)
  data?: MemoryStoredFile;
}
