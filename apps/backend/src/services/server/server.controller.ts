import { Body, Controller } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerAuthorityService } from './services/server-authority.service';
import { ServerFileService } from './services/server-file.service';
import { ServerLogService } from './services/server-log.service';
import { ServerManagerService } from './services/server-manager.service';
import { ServerPlayerService } from './services/server-player.service';
import { ServerRuntimeService } from './services/server-runtime.service';
import { ServerWebhookService } from './services/server-webhook.service';
import { Route, routeHandler, sseRouteHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';
import { CreateFileDto } from '@/services/server/dto/create-file.dto';
import { getRealIp } from '@/utils/query.utils';

@Controller()
export class ServerController {
  constructor(
    private readonly serverService: ServerService,
    private readonly serverManagerService: ServerManagerService,
    private readonly serverAuthorityService: ServerAuthorityService,
    private readonly serverLogService: ServerLogService,
    private readonly serverWebhookService: ServerWebhookService,
    private readonly serverFileService: ServerFileService,
    private readonly serverPlayerService: ServerPlayerService,
    private readonly serverRuntimeService: ServerRuntimeService,
  ) {}

  @Route(api.v4.servers.managers.create)
  async createServerManager() {
    return routeHandler(
      api.v4.servers.managers.create,
      ({ body, user }) => this.serverManagerService.createServerManager(body, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.managers.getFreeToUseServerManager)
  async getFreeToUseServerManager() {
    return routeHandler(
      api.v4.servers.managers.getFreeToUseServerManager,
      () => this.serverManagerService.getFreeToUseServerManager(),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.managers.getMyServerManagers)
  async getMyServerManagers() {
    return routeHandler(
      api.v4.servers.managers.getMyServerManagers,
      ({ user }) => this.serverManagerService.getMyServerManagers(user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.managers.get)
  async getServerManager() {
    return routeHandler(
      api.v4.servers.managers.get,
      ({ params, user }) => this.serverManagerService.getServerManager(params.id, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.managers.isOwner)
  async isOwner() {
    return routeHandler(
      api.v4.servers.managers.isOwner,
      ({ params, user }) => this.serverManagerService.isOwner(params.id, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.managers.reset)
  async resetServerManager() {
    return routeHandler(
      api.v4.servers.managers.reset,
      ({ params, user }) => this.serverManagerService.resetServerManager(params.id, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.managers.findFreePort)
  async findFreePort() {
    return routeHandler(
      api.v4.servers.managers.findFreePort,
      ({ params }) => this.serverManagerService.findFreePort(params.id),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.create)
  async createServer() {
    return routeHandler(api.v4.servers.create, ({ body, user }) => this.serverService.createServer(body, user), {
      filter: true,
    });
  }

  @Route(api.v4.servers.update)
  async updateServer() {
    return routeHandler(
      api.v4.servers.update,
      ({ params, body, user }) => this.serverService.updateServer(params.id, body, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.findAll)
  async listServers() {
    return routeHandler(api.v4.servers.findAll, ({ query }) => this.serverService.listServers(query));
  }

  @Route(api.v4.servers.findMyServer)
  async findMyServer() {
    return routeHandler(
      api.v4.servers.findMyServer,
      ({ query, user }) => this.serverService.findMyServer(query, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.findMismatch)
  async findMismatch() {
    return routeHandler(
      api.v4.servers.findMismatch,
      ({ params, user }) => this.serverRuntimeService.findMismatch(params.id, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.count)
  async countServers() {
    return routeHandler(api.v4.servers.count, () => this.serverService.countServers());
  }

  @Route(api.v4.servers.host)
  async host() {
    return sseRouteHandler(
      api.v4.servers.host,
      ({ params, next, sse, user }) => this.serverRuntimeService.host(params.id, next, sse, user),
      {
        filter: true,
        authorize: async ({ params, user }) => {
          await this.serverRuntimeService.assertServerHostAccess(params.id, user);
        },
      },
    );
  }

  @Route(api.v4.servers.pause)
  async pause() {
    return routeHandler(api.v4.servers.pause, ({ params, user }) => this.serverRuntimeService.pause(params.id, user), {
      filter: true,
      limit: [20, 'minute'],
    });
  }

  @Route(api.v4.servers.hostServer)
  async hostServer() {
    return routeHandler(api.v4.servers.hostServer, ({ params, req }) =>
      this.serverRuntimeService.hostServer(
        params.id,
        String(req.headers['x-manager-auth']),
        String(req.headers['x-server-id']),
        getRealIp(req),
      ),
    );
  }

  @Route(api.v4.servers.get)
  async getServer() {
    return routeHandler(api.v4.servers.get, ({ params }) => this.serverService.getServer(params.id));
  }

  @Route(api.v4.servers.image)
  async getServerImage() {
    return routeHandler(api.v4.servers.image, ({ params, res }) => this.serverService.getServerImage(params.id, res), {
      limit: [60, 'minute'],
    });
  }

  @Route(api.v4.servers.usage)
  async getServerUsage() {
    return sseRouteHandler(
      api.v4.servers.usage,
      ({ params, next, sse, user }) => this.serverRuntimeService.getServerUsage(params.id, next, sse, user),
      {
        filter: true,
        authorize: ({ params, user }) => this.serverRuntimeService.assertServerStateAccess(params.id, user),
      },
    );
  }

  @Route(api.v4.servers.state)
  async getServerState() {
    return sseRouteHandler(
      api.v4.servers.state,
      ({ params, next, sse, user }) => this.serverRuntimeService.getServerState(params.id, next, sse, user),
      {
        filter: true,
        authorize: ({ params, user }) => this.serverRuntimeService.assertServerStateAccess(params.id, user),
      },
    );
  }

  @Route(api.v4.servers.getLogs)
  async getServerLogs() {
    return routeHandler(
      api.v4.servers.getLogs,
      ({ params, query, user }) => this.serverLogService.getServerLogs(params.id, query, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.getLogStream)
  async getServerLogStream() {
    return sseRouteHandler(
      api.v4.servers.getLogStream,
      ({ params, sse, user }) => this.serverLogService.getServerLogStream(params.id, sse, user),
      {
        filter: true,
        authorize: ({ params, user }) => this.serverLogService.assertLogAccess(params.id, user),
      },
    );
  }

  @Route(api.v4.servers.commands.send)
  async sendCommand() {
    return routeHandler(
      api.v4.servers.commands.send,
      ({ params, body, user }) => this.serverRuntimeService.sendCommand(params.id, body, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.commands.getAll)
  async getAllCommands() {
    return routeHandler(
      api.v4.servers.commands.getAll,
      ({ params, user }) => this.serverRuntimeService.getAllCommands(params.id, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.remove)
  async removeServer() {
    return routeHandler(api.v4.servers.remove, ({ params, user }) => this.serverService.removeServer(params.id, user), {
      filter: true,
    });
  }

  @Route(api.v4.servers.files.install)
  async installFile() {
    return routeHandler(
      api.v4.servers.files.install,
      ({ params, body, user }) => this.serverFileService.installFile(params.id, body, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.files.list)
  async listFiles() {
    return routeHandler(api.v4.servers.files.list, ({ params, query, res, user }) =>
      this.serverFileService.listFiles(params.id, query.path, res, user),
    );
  }

  @Route(api.v4.servers.files.createFolder)
  async createFolder() {
    return routeHandler(
      api.v4.servers.files.createFolder,
      ({ params, query, user }) => this.serverFileService.createFolder(params.id, query.path, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.files.write, { formData: true })
  async writeFile(@Body() body: CreateFileDto) {
    return routeHandler(
      api.v4.servers.files.write,
      ({ params, query, user }) => this.serverFileService.writeFile(params.id, query.path, body, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.files.download)
  async downloadFile() {
    return routeHandler(
      api.v4.servers.files.download,
      ({ params, query, res, user }) => this.serverFileService.downloadFile(params.id, query.path, res, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.maps.getAll)
  async getAllMaps() {
    return routeHandler(api.v4.servers.maps.getAll, ({ params }) => this.serverFileService.getAllMaps(params.id));
  }

  @Route(api.v4.servers.mods.getAll)
  async getAllMods() {
    return routeHandler(api.v4.servers.mods.getAll, ({ params }) => this.serverFileService.getAllMods(params.id));
  }

  @Route(api.v4.servers.files.delete)
  async deleteFile() {
    return routeHandler(
      api.v4.servers.files.delete,
      ({ params, query, user }) => this.serverFileService.deleteFile(params.id, query.path, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.adminUpdate)
  async adminUpdateServer() {
    return routeHandler(
      api.v4.servers.adminUpdate,
      ({ params, body, user }) => this.serverService.adminUpdateServer(params.id, body, user),
      {
        filter: 'server:manage',
      },
    );
  }

  @Route(api.v4.servers.delete)
  async deleteServer() {
    return routeHandler(api.v4.servers.delete, ({ params, user }) => this.serverService.deleteServer(params.id, user), {
      filter: true,
    });
  }

  @Route(api.v4.servers.players.getAll)
  async getPlayers() {
    return routeHandler(
      api.v4.servers.players.getAll,
      ({ params, user }) => this.serverPlayerService.getPlayers(params.id, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.players.getPlayerInfos)
  async getPlayerInfos() {
    return routeHandler(
      api.v4.servers.players.getPlayerInfos,
      ({ params, query, user }) => this.serverPlayerService.getPlayerInfos(params.id, query, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.recentPlayers)
  async getRecentPlayers() {
    return routeHandler(
      api.v4.servers.recentPlayers,
      ({ params, user }) => this.serverPlayerService.getRecentPlayers(params.id, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.kicks.getAll)
  async getKickedIps() {
    return routeHandler(
      api.v4.servers.kicks.getAll,
      ({ params, user }) => this.serverPlayerService.getKickedIps(params.id, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.kicks.remove)
  async removeKickedIp() {
    return routeHandler(
      api.v4.servers.kicks.remove,
      ({ params, user }) => this.serverPlayerService.removeKickedIp(params.id, params.ip, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.login)
  async login() {
    return routeHandler(api.v4.servers.login, ({ params, body }) => this.serverPlayerService.login(params.id, body), {
      limit: [10, 'minute'],
    });
  }

  @Route(api.v4.servers.verifyLogin)
  async verifyLogin() {
    return routeHandler(
      api.v4.servers.verifyLogin,
      ({ params, user }) => this.serverPlayerService.verifyLogin(params.token, user),
      {
        filter: true,
        limit: [10, 'minute'],
      },
    );
  }

  @Route(api.v4.servers.loginToken)
  async loginToken() {
    return routeHandler(api.v4.servers.loginToken, ({ params }) => this.serverPlayerService.loginToken(params.token), {
      limit: [10, 'minute'],
    });
  }

  @Route(api.v4.servers.admins.getAll)
  async getAllAdmins() {
    return routeHandler(
      api.v4.servers.admins.getAll,
      ({ params, user }) => this.serverAuthorityService.getAllAdmins(params.id, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.admins.update)
  async updateAdmin() {
    return routeHandler(
      api.v4.servers.admins.update,
      ({ params, body, user }) => this.serverAuthorityService.updateAdmin(params.id, body, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.admins.delete)
  async deleteAdmin() {
    return routeHandler(
      api.v4.servers.admins.delete,
      ({ params, user }) => this.serverAuthorityService.deleteAdmin(params.id, params.adminId, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.getResolvedConfig)
  async getResolvedConfig() {
    return routeHandler(
      api.v4.servers.getResolvedConfig,
      ({ params, user }) => this.serverAuthorityService.getResolvedConfig(params.id, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.getMyAuthorities)
  async getMyAuthorities() {
    return routeHandler(api.v4.servers.getMyAuthorities, ({ params, user }) =>
      this.serverAuthorityService.getMyAuthorities(params.id, user),
    );
  }

  @Route(api.v4.servers.webhooks.create)
  async createWebhook() {
    return routeHandler(
      api.v4.servers.webhooks.create,
      ({ params, body, user }) => this.serverWebhookService.createWebhook(params.id, body, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.webhooks.update)
  async updateWebhook() {
    return routeHandler(
      api.v4.servers.webhooks.update,
      ({ params, body, user }) => this.serverWebhookService.updateWebhook(params.id, params.webhookId, body, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.webhooks.delete)
  async deleteWebhook() {
    return routeHandler(
      api.v4.servers.webhooks.delete,
      ({ params, user }) => this.serverWebhookService.deleteWebhook(params.id, params.webhookId, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.webhooks.getAll)
  async getAllWebhooks() {
    return routeHandler(
      api.v4.servers.webhooks.getAll,
      ({ params, user }) => this.serverWebhookService.getAllWebhooks(params.id, user),
      {
        filter: true,
      },
    );
  }

  @Route(api.v4.servers.webhooks.events.getAll)
  async getAllWebhookEvents() {
    return routeHandler(api.v4.servers.webhooks.events.getAll, () => this.serverWebhookService.getAllWebhookEvents(), {
      filter: true,
    });
  }

  @Route(api.v4.servers.credit.transfer)
  async transferCredit() {
    return routeHandler(
      api.v4.servers.credit.transfer,
      ({ params, body, user }) => this.serverService.transferCredit(params.id, body, user),
      {
        filter: 'user:server:credit:transfer',
      },
    );
  }
}
