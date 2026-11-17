import { IsOptional, IsString } from 'class-validator';
import { IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';

export class MapPreviewDto {
  @IsOptional()
  @IsFile()
  @MaxFileSize(3e6)
  file?: MemoryStoredFile | null;

  @IsOptional()
  @IsString()
  data?: string | null;
}
