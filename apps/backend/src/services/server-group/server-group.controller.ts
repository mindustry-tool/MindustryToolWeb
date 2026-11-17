import { Controller } from '@nestjs/common';
import { ServerGroupService } from './server-group.service';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { api } from '@mindustry-tool/api';

@Controller()
export class ServerGroupController {
  constructor(private readonly serverGroupService: ServerGroupService) {}

  @Route(api.v4.serverGroups.create)
  async createGroup() {
    return routeHandler(api.v4.serverGroups.create, ({ body, user }) => this.serverGroupService.createGroup(body, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.list)
  async listGroups() {
    return routeHandler(api.v4.serverGroups.list, ({ user }) => this.serverGroupService.listGroups(user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.get)
  async getGroup() {
    return routeHandler(api.v4.serverGroups.get, ({ params, user }) => this.serverGroupService.getGroup(params.groupId, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.update)
  async updateGroup() {
    return routeHandler(api.v4.serverGroups.update, ({ params, body, user }) => this.serverGroupService.updateGroup(params.groupId, body, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.delete)
  async deleteGroup() {
    return routeHandler(api.v4.serverGroups.delete, ({ params, user }) => this.serverGroupService.deleteGroup(params.groupId, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.admins.list)
  async listGroupAdmins() {
    return routeHandler(api.v4.serverGroups.admins.list, ({ params, user }) => this.serverGroupService.listGroupAdmins(params.groupId, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.admins.upsert)
  async upsertGroupAdmin() {
    return routeHandler(api.v4.serverGroups.admins.upsert, ({ params, body, user }) => this.serverGroupService.upsertGroupAdmin(params.groupId, body, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.admins.delete)
  async deleteGroupAdmin() {
    return routeHandler(api.v4.serverGroups.admins.delete, ({ params, user }) => this.serverGroupService.deleteGroupAdmin(params.groupId, params.adminId, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.envs.list)
  async listGroupEnvs() {
    return routeHandler(api.v4.serverGroups.envs.list, ({ params, user }) => this.serverGroupService.listGroupEnvs(params.groupId, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.envs.upsert)
  async upsertGroupEnv() {
    return routeHandler(api.v4.serverGroups.envs.upsert, ({ params, body, user }) => this.serverGroupService.upsertGroupEnv(params.groupId, body, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.envs.delete)
  async deleteGroupEnv() {
    return routeHandler(api.v4.serverGroups.envs.delete, ({ params, user }) => this.serverGroupService.deleteGroupEnv(params.groupId, params.envId, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.servers.list)
  async listGroupServers() {
    return routeHandler(api.v4.serverGroups.servers.list, ({ params, user }) => this.serverGroupService.listGroupServers(params.groupId, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.servers.assign)
  async assignServer() {
    return routeHandler(api.v4.serverGroups.servers.assign, ({ params, body, user }) => this.serverGroupService.assignServer(params.groupId, body.serverId, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.servers.unassign)
  async unassignServer() {
    return routeHandler(api.v4.serverGroups.servers.unassign, ({ params, user }) => this.serverGroupService.unassignServer(params.groupId, params.serverId, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.webhooks.getAll)
  async listGroupWebhooks() {
    return routeHandler(api.v4.serverGroups.webhooks.getAll, ({ params, user }) => this.serverGroupService.listGroupWebhooks(params.groupId, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.webhooks.create)
  async createGroupWebhook() {
    return routeHandler(api.v4.serverGroups.webhooks.create, ({ params, body, user }) => this.serverGroupService.createGroupWebhook(params.groupId, body, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.webhooks.update)
  async updateGroupWebhook() {
    return routeHandler(api.v4.serverGroups.webhooks.update, ({ params, body, user }) => this.serverGroupService.updateGroupWebhook(params.groupId, params.webhookId, body, user), {
      filter: true,
    });
  }

  @Route(api.v4.serverGroups.webhooks.delete)
  async deleteGroupWebhook() {
    return routeHandler(api.v4.serverGroups.webhooks.delete, ({ params, user }) => this.serverGroupService.deleteGroupWebhook(params.groupId, params.webhookId, user), {
      filter: true,
    });
  }
}
