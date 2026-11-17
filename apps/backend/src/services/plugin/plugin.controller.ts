import { Controller } from '@nestjs/common';
import { PluginService } from './plugin.service';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';

@Controller()
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Route(api.v4.plugins.download)
  async download() {
    return routeHandler(api.v4.plugins.download, ({ res, query }) => this.pluginService.download(res, query));
  }

  @Route(api.v4.plugins.version)
  async version() {
    return routeHandler(api.v4.plugins.version, ({ query }) => this.pluginService.version(query));
  }
}
