import { Body, Controller } from '@nestjs/common';
import { ImageService } from './image.service';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';
import { CreateImageDto } from '@/services/image/dto/create-image.dto';

@Controller()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Route(api.v4.images.create, { formData: true })
  createShared(@Body() body: CreateImageDto) {
    return routeHandler(api.v4.images.create, ({ user }) => this.imageService.createImage(user, body), {
      filter: 'god',
      limit: [20, 'minute'],
    });
  }

  @Route(api.v4.images.folders.create)
  createFolder() {
    return routeHandler(api.v4.images.folders.create, ({ body, user }) => this.imageService.createFolder(body, user), {
      filter: 'god',
      limit: [20, 'minute'],
    });
  }

  @Route(api.v4.images.folders.update)
  updateFolder() {
    return routeHandler(
      api.v4.images.folders.update,
      ({ body, params }) => this.imageService.updateFolder(params.id, body),
      {
        filter: 'god',
        limit: [20, 'minute'],
      },
    );
  }

  @Route(api.v4.images.get)
  async get() {
    return routeHandler(api.v4.images.get, ({ query }) => this.imageService.get(query));
  }

  @Route(api.v4.images.count)
  async getCount() {
    return routeHandler(api.v4.images.count, ({ query }) => this.imageService.getCount(query));
  }

  @Route(api.v4.images.delete)
  async delete() {
    return routeHandler(api.v4.images.delete, ({ params }) => this.imageService.delete(params.id), {
      limit: [20, 'minute'],
    });
  }
}
