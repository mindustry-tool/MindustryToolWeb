import { Controller, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ImageProxyService } from './image-proxy.service';
import { TransformOptionsDto } from './dto/transform-options.dto';
import { pipeStreamToResponse } from '@/utils/utils';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';

@Controller()
export class ImageProxyController {
  constructor(private readonly imageProxyService: ImageProxyService) {}

  @Version(VERSION_NEUTRAL)
  @Route(api.v4.proxy.get)
  async getImage() {
    return routeHandler(api.v4.proxy.get, async ({ res, query, params }) => {
      const { bucket, path } = params;
      const options = new TransformOptionsDto(query);
      const imagePath = decodeURIComponent(path.join('/'));

      if (res.destroyed || res.writableEnded || !res.writable) {
        return;
      }

      const { stream, contentType } = await this.imageProxyService.getImage(bucket, imagePath, options);

      if (res.destroyed || res.writableEnded || !res.writable) {
        stream.destroy();
        return;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=604800');

      await pipeStreamToResponse(stream, res);
    });
  }
}
