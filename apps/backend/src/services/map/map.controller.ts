import { Body, Controller, Header, Post, Res } from '@nestjs/common';
import { MapService } from './map.service';
import { api } from '@mindustry-tool/api';
import { mapDetailDtoSchema } from '@mindustry-tool/api';
import { MapPreviewDto } from '@/services/map/dto/map-preview.dto';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { MapUploadDto } from '@/services/map/dto/map-upload.dto';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { getRealIp } from '@/utils/query.utils';
import { UserId } from '@/decorators/session.decorator';
import { MapPreviewJsonDto } from '@/services/map/dto/map-preview-json';
import { PreviewImageQuery } from '@/types/query.types';
import { pipeStreamToResponse } from '@/utils/utils';

@Controller()
export class MapController {
  constructor(private readonly mapsService: MapService) {}

  @Post('/maps/preview')
  @FormDataRequest()
  async preview(@Body() body: MapPreviewDto) {
    return this.mapsService.preview(body);
  }

  @Post('/maps/image')
  @Header('Content-Type', 'image/png')
  @FormDataRequest()
  async image(@Body() body: MapPreviewDto, @Res() res: Response) {
    const buffer = await this.mapsService.image(body);

    res.send(buffer);
  }

  @Post('/maps/image-json')
  @Header('Content-Type', 'image/png')
  async imageJson(@Body() body: MapPreviewJsonDto, @Res() res: Response) {
    const buffer = await this.mapsService.image(body);

    res.send(buffer);
  }

  @Post('/maps')
  @FormDataRequest()
  async upload(@Body() body: MapUploadDto, @UserId() userId: string) {
    return await this.mapsService.upload(body, userId);
  }

  @Route(api.v4.maps.findAll)
  findAll() {
    return routeHandler(api.v4.maps.findAll, ({ query }) => this.mapsService.findAll(query));
  }

  @Route(api.v4.maps.getImage)
  async getImage() {
    return routeHandler(
      api.v4.maps.getImage,
      async ({ params, query, res }) => {
        const { id } = params;

        if (res.destroyed || res.writableEnded || !res.writable) {
          return;
        }

        const { stream, contentType } = await this.mapsService.getImage(id, new PreviewImageQuery(query));

        if (res.destroyed || res.writableEnded || !res.writable) {
          stream.destroy();
          return;
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=604800');

        await pipeStreamToResponse(stream, res);
      },
      { limit: [60, 'minute'] },
    );
  }

  @Route(api.v4.maps.data)
  async getData() {
    return routeHandler(
      api.v4.maps.data,
      async ({ params, res, req }) => {
        const { id } = params;
        const ip = getRealIp(req);
        const { data, name } = await this.mapsService.getData(id, ip);
        const buffer = Buffer.from(data);

        if (res.destroyed || res.writableEnded || !res.writable) {
          return;
        }

        // Remove all invalid characters from filename
        const filename = name.replace(/[^\w\s-]/g, '_').trim();

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.msav"`);
        res.setHeader('Cache-Control', 'public, max-age=2592000');
        res.setHeader('Expires', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString());
        res.send(buffer);
      },
      { limit: [10, 'minute'] },
    );
  }

  @Route(api.v4.maps.count)
  count() {
    return routeHandler(api.v4.maps.count, ({ query }) => this.mapsService.count(query));
  }

  @Route(api.v4.maps.get)
  get() {
    return routeHandler(api.v4.maps.get, ({ params }) => this.mapsService.get(params.id));
  }

  @Route(api.v4.maps.update)
  update() {
    return routeHandler(
      api.v4.maps.update,
      ({ params, body, user }) =>
        this.mapsService.update(params.id, body, user).then((item) => mapDetailDtoSchema.parse(item)),
      { filter: 'map:manage' },
    );
  }
}
