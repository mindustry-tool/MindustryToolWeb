import { ApiInstance } from '@mindustry-tool/api';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiService {
  public readonly contentParserInstance: ApiInstance;
  public readonly apiV4Instance: ApiInstance;
  public readonly serverManagerInstance: ApiInstance;

  constructor(private configService: ConfigService) {
    this.contentParserInstance = new ApiInstance({
      baseUrl: configService.getOrThrow('contentParser.url') + '/api',
      timeout: 180_000,
    });

    this.apiV4Instance = new ApiInstance({
      baseUrl: configService.getOrThrow('apiV4.url'),
    });

    this.serverManagerInstance = new ApiInstance({
      baseUrl: '',
    });
  }
}
