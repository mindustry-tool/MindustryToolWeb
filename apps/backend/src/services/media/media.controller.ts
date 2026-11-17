import { Body, Controller, Post } from '@nestjs/common';
import { MediaService } from './media.service';
import { UserId } from '@/decorators/session.decorator';
import { api } from '@mindustry-tool/api';
import { CreateMediaDto } from '@/services/media/dto/create-media.dto';
import { FormDataRequest } from 'nestjs-form-data';
import { MediaType } from '@/generated/prisma/client';
import { Route, routeHandler } from '@/decorators/route.decorator';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('media')
  @FormDataRequest()
  create(@UserId() userId: string, @Body() body: CreateMediaDto) {
    return this.mediaService.createMedia(userId, body, MediaType.USER_CREATED);
  }

  @Route(api.v4.media.getMy)
  async getMy() {
    return routeHandler(api.v4.media.getMy, ({ query, user }) => this.mediaService.getMy(query, user), {
      filter: true,
    });
  }

  @Route(api.v4.media.get)
  async get() {
    return routeHandler(api.v4.media.get, ({ query }) => this.mediaService.get(query), {
      filter: 'audit:view',
    });
  }

  @Route(api.v4.media.delete)
  async delete() {
    return routeHandler(api.v4.media.delete, ({ params }) => this.mediaService.delete(params.id), {
      filter: 'media:delete',
      limit: [20, 'minute'],
    });
  }
}
