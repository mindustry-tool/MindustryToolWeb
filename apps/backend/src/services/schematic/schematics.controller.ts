import { Body, Controller, Header, Post, Res } from '@nestjs/common';
import { SchematicService } from './schematics.service';
import { api } from '@mindustry-tool/api';
import { schematicDetailDtoSchema } from '@mindustry-tool/api';
import { SchematicPreviewDto } from '@/services/schematic/dto/schematic-preview.dto';
import { FormDataRequest } from 'nestjs-form-data';
import { Response } from 'express';
import { SchematicUploadDto } from '@/services/schematic/dto/schematic-upload.dto';
import { UserId } from '@/decorators/session.decorator';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { getRealIp } from '@/utils/query.utils';
import { PreviewImageQuery } from '@/types/query.types';
import { pipeStreamToResponse } from '@/utils/utils';

@Controller()
export class SchematicController {
  constructor(private readonly schematicsService: SchematicService) {}

  @Post('/schematics/preview')
  @FormDataRequest()
  async preview(@Body() body: SchematicPreviewDto) {
    return this.schematicsService.preview(body);
  }

  @Post('/schematics/image')
  @Header('Content-Type', 'image/png')
  @FormDataRequest()
  async image(@Body() body: SchematicPreviewDto, @Res() res: Response) {
    const buffer = await this.schematicsService.image(body);

    res.send(buffer);
  }

  @Post('/schematics')
  @FormDataRequest()
  async upload(@Body() body: SchematicUploadDto, @UserId() userId: string) {
    return await this.schematicsService.upload(body, userId);
  }

  @Route(api.v4.schematics.findAll)
  findAll() {
    return routeHandler(api.v4.schematics.findAll, ({ query }) => this.schematicsService.findAll(query));
  }

  @Route(api.v4.schematics.getImage)
  async getImage() {
    return routeHandler(
      api.v4.schematics.getImage,
      async ({ params, res, query }) => {
        const { id } = params;

        if (res.destroyed || res.writableEnded || !res.writable) {
          return;
        }

        const { stream, contentType } = await this.schematicsService.getImage(id, new PreviewImageQuery(query));

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

  @Route(api.v4.schematics.data)
  async getData() {
    return routeHandler(
      api.v4.schematics.data,
      async ({ params, res, req }) => {
        const { id } = params;
        const ip = getRealIp(req);
        const { data, name } = await this.schematicsService.getData(id, ip);
        const buffer = Buffer.from(data);

        if (res.destroyed || res.writableEnded || !res.writable) {
          return;
        }

        // Remove all invalid characters from filename
        const filename = name.replace(/[^\w\s-]/g, '_').trim();

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.msch"`);
        res.setHeader('Cache-Control', 'public, max-age=2592000');
        res.setHeader('Expires', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString());
        res.send(buffer);
      },
      { limit: [10, 'minute'] },
    );
  }

  @Route(api.v4.schematics.count)
  count() {
    return routeHandler(api.v4.schematics.count, ({ query }) => this.schematicsService.count(query));
  }

  @Route(api.v4.schematics.get)
  get() {
    return routeHandler(api.v4.schematics.get, ({ params }) =>
      this.schematicsService.get(params.id).then((item) => schematicDetailDtoSchema.parse(item)),
    );
  }

  @Route(api.v4.schematics.update)
  update() {
    return routeHandler(
      api.v4.schematics.update,
      ({ params, body, user }) =>
        this.schematicsService.update(params.id, body, user).then((item) => schematicDetailDtoSchema.parse(item)),
      { filter: 'schematic:manage' },
    );
  }
}
