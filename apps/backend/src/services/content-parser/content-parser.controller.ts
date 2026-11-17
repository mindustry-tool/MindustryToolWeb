import { Controller } from '@nestjs/common';
import { ContentParserService } from './content-parser.service';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';

@Controller()
export class ContentParserController {
  constructor(private readonly contentParserService: ContentParserService) {}

  @Route(api.v4.imageGenerators.sorter, { formData: true })
  async generateSortImage() {
    return routeHandler(
      api.v4.imageGenerators.sorter,
      ({ body }) => this.contentParserService.generateSortImage(body),
      {
        limit: [10, 'minute'],
      },
    );
  }
}
