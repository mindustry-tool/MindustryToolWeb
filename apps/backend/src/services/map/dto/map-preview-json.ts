import { IsString } from 'class-validator';

export class MapPreviewJsonDto {
  @IsString()
  data: string;
}
