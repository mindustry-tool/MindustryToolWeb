import { PrismaService } from '@/prisma/prisma.service';
import { api } from '@mindustry-tool/api';
import { ApiBody } from '@mindustry-tool/api';
import { hasAccess } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';
import { ServerGroupWebhook } from '@/generated/prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { v7 as uuidv7 } from 'uuid';
import { ServerRuntimeService } from '@/services/server/services/server-runtime.service';

@Injectable()
export class ServerGroupService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cache: Cache,
    private readonly serverRuntimeService: ServerRuntimeService,
  ) {}

  private readonly MAX_WEBHOOK_EVENTS = 5;

  private async clearGroupWebhookCache(groupId: string) {
    const servers = await this.prismaService.server.findMany({
      where: {
        groupId,
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      servers.map((server) =>
        this.cache.del(`server:${server.id}:webhooks:group`),
      ),
    );
  }

  async getGroupWebhooksWithCache(
    groupId: string,
  ): Promise<ServerGroupWebhook[]> {
    const cacheKey = `server-group:${groupId}:webhooks`;

    const cached = await this.cache.get<ServerGroupWebhook[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const webhooks = await this.prismaService.serverGroupWebhook.findMany({
      where: {
        groupId,
        active: true,
      },
    });

    await this.cache.set(cacheKey, webhooks, 1000 * 60);

    return webhooks;
  }

  private async assertGroupOwner(groupId: string, userId: string) {
    const group = await this.prismaService.serverGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Server group not found');
    }

    if (group.ownerId !== userId) {
      throw new ForbiddenException();
    }

    return group;
  }

  async createGroup(body: ApiBody<typeof api.v4.serverGroups.create>, user: Session) {
    const { name, description } = body;
    const id = uuidv7();

    return this.prismaService.serverGroup.create({
      data: {
        id,
        name,
        description,
        ownerId: user.id,
        createdBy: user.id,
        createdAt: new Date(),
      },
    });
  }

  async listGroups(user: Session) {
    return this.prismaService.serverGroup.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getGroup(groupId: string, user: Session) {
    return this.assertGroupOwner(groupId, user.id);
  }

  async updateGroup(groupId: string, body: ApiBody<typeof api.v4.serverGroups.update>, user: Session) {
    const { name, description } = body;

    await this.assertGroupOwner(groupId, user.id);

    return this.prismaService.serverGroup.update({
      where: { id: groupId },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        updatedAt: new Date(),
        updatedBy: user.id,
      },
    });
  }

  async deleteGroup(groupId: string, user: Session) {
    await this.assertGroupOwner(groupId, user.id);

    const group = await this.prismaService.serverGroup.delete({
      where: { id: groupId },
    });

    return group;
  }

  async listGroupAdmins(groupId: string, user: Session) {
    await this.assertGroupOwner(groupId, user.id);

    return this.prismaService.groupServerAdmin.findMany({
      where: { groupId },
    });
  }

  async upsertGroupAdmin(groupId: string, body: ApiBody<typeof api.v4.serverGroups.admins.upsert>, user: Session) {
    const { userId, authorities } = body;

    await this.assertGroupOwner(groupId, user.id);

    const result = await this.prismaService.groupServerAdmin.upsert({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      create: {
        id: uuidv7(),
        groupId,
        userId,
        authorities,
        createdAt: new Date(),
        createdBy: user.id,
      },
      update: {
        authorities,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
    });

    // Invalidate authority cache for all servers in this group for the affected user
    const servers = await this.prismaService.server.findMany({
      where: { groupId },
      select: { id: true },
    });

    await Promise.all(servers.map((server) => this.cache.del(`server:${server.id}:${userId}:authorities`)));

    return result;
  }

  async deleteGroupAdmin(groupId: string, adminId: string, user: Session) {
    await this.assertGroupOwner(groupId, user.id);

    const admin = await this.prismaService.groupServerAdmin.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.groupId !== groupId) {
      throw new NotFoundException('Group admin not found');
    }

    const result = await this.prismaService.groupServerAdmin.delete({
      where: { id: adminId },
    });

    // Invalidate authority cache for all servers in this group for the removed user
    const servers = await this.prismaService.server.findMany({
      where: { groupId },
      select: { id: true },
    });

    await Promise.all(servers.map((server) => this.cache.del(`server:${server.id}:${admin.userId}:authorities`)));

    return result;
  }

  async listGroupEnvs(groupId: string, user: Session) {
    await this.assertGroupOwner(groupId, user.id);

    return this.prismaService.groupServerEnv.findMany({
      where: { groupId },
    });
  }

  private async syncGroupServersConfig(groupId: string) {
    try {
      const servers = await this.prismaService.server.findMany({
        where: { groupId },
        select: { id: true },
      });

      for (const server of servers) {
        void this.serverRuntimeService.pushServerConfigIfRunning(server.id);
      }
    } catch {
      // Intentionally silent: the database edit already succeeded and the
      // mismatch display remains the fallback signal.
    }
  }

  async upsertGroupEnv(groupId: string, body: ApiBody<typeof api.v4.serverGroups.envs.upsert>, user: Session) {
    const { name, value } = body;

    await this.assertGroupOwner(groupId, user.id);

    const result = await this.prismaService.groupServerEnv.upsert({
      where: {
        groupId_name: {
          groupId,
          name,
        },
      },
      create: {
        id: uuidv7(),
        groupId,
        name,
        value,
        createdAt: new Date(),
        createdBy: user.id,
      },
      update: {
        value,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
    });

    void this.syncGroupServersConfig(groupId);

    return result;
  }

  async deleteGroupEnv(groupId: string, envId: string, user: Session) {
    await this.assertGroupOwner(groupId, user.id);

    const env = await this.prismaService.groupServerEnv.findUnique({
      where: { id: envId },
    });

    if (!env || env.groupId !== groupId) {
      throw new NotFoundException('Group env not found');
    }

    const result = await this.prismaService.groupServerEnv.delete({
      where: { id: envId },
    });

    void this.syncGroupServersConfig(groupId);

    return result;
  }

  async listGroupServers(groupId: string, user: Session) {
    await this.assertGroupOwner(groupId, user.id);

    return this.prismaService.server.findMany({
      where: { groupId },
    });
  }

  async assignServer(groupId: string, serverId: string, user: Session) {
    await this.assertGroupOwner(groupId, user.id);

    const server = await this.prismaService.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    if (!hasAccess(user, { authorId: server.createdBy })) {
      throw new ForbiddenException('You do not has access to this server');
    }

    const result = await this.prismaService.server.update({
      where: { id: serverId },
      data: {
        groupId,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
    });

    await this.cache.del(`server:${serverId}`);
    await this.cache.del(`server:${serverId}:${user.id}:authorities`);

    void this.serverRuntimeService.pushServerConfigIfRunning(serverId);

    return result;
  }

  async unassignServer(groupId: string, serverId: string, user: Session) {
    await this.assertGroupOwner(groupId, user.id);

    const server = await this.prismaService.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      throw new NotFoundException('Server not found');
    }

    if (server.groupId !== groupId) {
      throw new BadRequestException('Server is not assigned to this group');
    }

    const result = await this.prismaService.server.update({
      where: { id: serverId },
      data: {
        groupId: null,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
    });

    await this.cache.del(`server:${serverId}`);
    await this.cache.del(`server:${serverId}:${user.id}:authorities`);

    void this.serverRuntimeService.pushServerConfigIfRunning(serverId);

    return result;
  }

  async listGroupWebhooks(groupId: string, user: Session) {
    await this.assertGroupOwner(groupId, user.id);

    return this.prismaService.serverGroupWebhook.findMany({
      where: { groupId },
      orderBy: {
        id: 'desc',
      },
    });
  }

  async createGroupWebhook(groupId: string, body: ApiBody<typeof api.v4.serverGroups.webhooks.create>, user: Session) {
    const { data, url, event, active } = body;

    await this.assertGroupOwner(groupId, user.id);

    const count = await this.prismaService.serverGroupWebhook.count({
      where: { groupId },
    });

    if (count >= this.MAX_WEBHOOK_EVENTS) {
      throw new BadRequestException('Server group webhook count exceeds the limit');
    }

    const result = await this.prismaService.serverGroupWebhook.create({
      data: {
        groupId,
        data,
        url,
        event,
        active: active ?? true,
        createdAt: new Date(),
        createdBy: user.id,
      },
    });

    await this.clearGroupWebhookCache(groupId);

    return result;
  }

  async updateGroupWebhook(groupId: string, webhookId: string, body: ApiBody<typeof api.v4.serverGroups.webhooks.update>, user: Session) {
    const { data, url, event, active } = body;

    await this.assertGroupOwner(groupId, user.id);

    const webhook = await this.prismaService.serverGroupWebhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || webhook.groupId !== groupId) {
      throw new NotFoundException('Group webhook not found');
    }

    const result = await this.prismaService.serverGroupWebhook.update({
      where: { id: webhookId },
      data: {
        data,
        url,
        event,
        active,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
    });

    await this.clearGroupWebhookCache(groupId);

    return result;
  }

  async deleteGroupWebhook(groupId: string, webhookId: string, user: Session) {
    await this.assertGroupOwner(groupId, user.id);

    const webhook = await this.prismaService.serverGroupWebhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || webhook.groupId !== groupId) {
      throw new NotFoundException('Group webhook not found');
    }

    const result = await this.prismaService.serverGroupWebhook.delete({
      where: { id: webhookId },
    });

    await this.clearGroupWebhookCache(groupId);

    return result;
  }
}
