import { IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data';

export class CreateMediaDto {
  @IsFile()
  @MaxFileSize(3e6)
  image: MemoryStoredFile;
}
