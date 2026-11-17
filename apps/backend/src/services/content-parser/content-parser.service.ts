import { api } from '@mindustry-tool/api';
import { ApiBody } from '@mindustry-tool/api';
import { ApiInstance } from '@mindustry-tool/api';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContentParserService {
  public apiInstance: ApiInstance;

  constructor(private configService: ConfigService) {
    this.apiInstance = new ApiInstance({
      baseUrl: this.configService.getOrThrow('contentParser.url') + '/api',
      timeout: 180_000,
      headers: {
        'x-source': 'backend',
      },
    });
  }

  async generateSortImage(body: ApiBody<typeof api.v4.imageGenerators.sorter>) {
    const form = new FormData();
    form.append('image', body.image);

    return this.apiInstance.request(api.v4.imageGenerators.sorter, {
      body,
    });
  }
}
