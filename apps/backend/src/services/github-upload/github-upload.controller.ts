import { Route, routeHandler } from '@/decorators/route.decorator';
import { GitHubUploadService } from '@/services/github-upload/github-upload.service';
import { api } from '@mindustry-tool/api';
import { Controller } from '@nestjs/common';

@Controller()
export class GitHubUploadController {
  constructor(private readonly gitHubUploadService: GitHubUploadService) {}

  @Route(api.v4.githubUploads.create)
  async createUpload() {
    return routeHandler(
      api.v4.githubUploads.create,
      async ({ user, body }) => this.gitHubUploadService.createUpload(body, user.id),
      {
        filter: 'god',
      },
    );
  }

  @Route(api.v4.githubUploads.findAll)
  async findAll() {
    return routeHandler(
      api.v4.githubUploads.findAll,
      async ({ query }) => await this.gitHubUploadService.findAll(query),
      {
        filter: 'god',
      },
    );
  }

  @Route(api.v4.githubUploads.count)
  async getCount() {
    return routeHandler(api.v4.githubUploads.count, async ({ query }) => await this.gitHubUploadService.count(query), {
      filter: 'god',
    });
  }

  @Route(api.v4.githubUploads.update)
  async updateUpload() {
    return routeHandler(
      api.v4.githubUploads.update,
      async ({ params, body }) => this.gitHubUploadService.update(params.id, body),
      {
        filter: 'god',
      },
    );
  }

  @Route(api.v4.githubUploads.delete)
  async deleteUpload() {
    return routeHandler(
      api.v4.githubUploads.delete,
      async ({ params }) => await this.gitHubUploadService.delete(params.id),
      {
        filter: 'god',
      },
    );
  }

  @Route(api.v4.discordUploads.upload)
  async discordUpload() {
    return routeHandler(
      api.v4.discordUploads.upload,
      async ({ body }) => await this.gitHubUploadService.handleDiscordUpload(body),
      { limit: [10, 'minute'] },
    );
  }
}
