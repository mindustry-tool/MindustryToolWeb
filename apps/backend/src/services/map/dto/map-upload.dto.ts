import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';

export class MapUploadDto {
  @IsOptional()
  @IsFile()
  @MaxFileSize(3e6)
  file?: MemoryStoredFile | null;

  @IsOptional()
  @IsString()
  data?: string | null;

  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsString({ each: true })
  tags?: string[] = [];
}
