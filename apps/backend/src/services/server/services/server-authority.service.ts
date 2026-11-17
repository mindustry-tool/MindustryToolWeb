import { PrismaService } from '@/prisma/prisma.service';
import { GroupServerAdmin, Server, ServerManager } from '@/generated/prisma/client';
import { api } from '@mindustry-tool/api';
import { ApiBody } from '@mindustry-tool/api';
import { AuthFilter, hasAccess } from '@mindustry-tool/api';
import { Session } from '@mindustry-tool/api';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { SERVER_CACHE_KEYS, SERVER_CONSTANTS } from '../server.constants';

@Injectable()
export class ServerAuthorityService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async getServerCached(id: string): Promise<Server & { manager: ServerManager }> {
    const cacheKey = SERVER_CACHE_KEYS.server(id);
    const cached = await this.cache.get<Server & { manager: ServerManager }>(cacheKey);

    if (cached) {
      return cached;
    }

    const server = await this.prismaService.server.findFirstOrThrow({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        manager: true,
      },
    });

    await this.cache.set(cacheKey, server, SERVER_CONSTANTS.SERVER_CACHE_EXPIRE_AFTER_MS);

    return server;
  }

  getUserServerAuthoritiesCacheKey(id: string, userId: string) {
    return SERVER_CACHE_KEYS.authorities(id, userId);
  }

  async clearServerAuthoritiesCache(id: string, userId: string) {
    const cacheKey = this.getUserServerAuthoritiesCacheKey(id, userId);
    await this.cache.del(cacheKey);
  }

  async getUserServerAuthorities(user: Session, id: string) {
    const cacheKey = this.getUserServerAuthoritiesCacheKey(id, user.id);
    const cached = await this.cache.get<string[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const server = await this.getServerCached(id);

    const [serverAuthorities, managerAuthorities, groupAuthorities] = await Promise.all([
      this.prismaService.serverAuthority.findMany({
        where: {
          serverId: id,
          userId: user.id,
        },
      }),
      this.prismaService.managerAuthority.findMany({
        where: {
          managerId: server.managerId,
          userId: user.id,
        },
      }),
      server.groupId
        ? this.prismaService.groupServerAdmin.findMany({
            where: {
              groupId: server.groupId,
              userId: user.id,
            },
          })
        : Promise.resolve([]),
    ]);

    const authoritiesSet = new Set<string>([...managerAuthorities.flatMap((item) => item.authorities)]);

    for (const item of serverAuthorities) {
      for (const auth of item.authorities) {
        authoritiesSet.add(auth);
      }
    }

    for (const item of groupAuthorities) {
      for (const auth of item.authorities) {
        authoritiesSet.add(auth);
      }
    }

    const authorities = [...authoritiesSet];

    await this.cache.set(cacheKey, authorities, SERVER_CONSTANTS.SERVER_CACHE_EXPIRE_AFTER_MS);

    return authorities;
  }

  async wrapServerSession(user: Session, id: string) {
    const authorities = await this.getUserServerAuthorities(user, id);

    return {
      ...user,
      authorities: [...user.authorities, ...authorities],
    };
  }

  async hasServerAccess(user: Session, id: string, filter: AuthFilter) {
    const session = await this.wrapServerSession(user, id);

    return hasAccess(session, filter);
  }

  async resolveGroupEnvs(groupId: string | null, serverId: string): Promise<Record<string, string>> {
    const [groupEnvs, serverEnvs] = await Promise.all([
      groupId
        ? this.prismaService.groupServerEnv.findMany({
            where: { groupId },
          })
        : Promise.resolve([]),
      this.prismaService.serverEnv.findMany({
        where: { serverId },
      }),
    ]);

    const merged: Record<string, string> = {};

    for (const env of groupEnvs) {
      merged[env.name] = env.value;
    }

    for (const env of serverEnvs) {
      merged[env.name] = env.value;
    }

    return merged;
  }

  async getAllAdmins(id: string, user: Session) {
    const server = await this.getServerCached(id);

    if (
      !(await this.hasServerAccess(user, id, {
        any: ['server:manage', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    return await this.prismaService.serverAuthority.findMany({
      where: {
        serverId: id,
      },
    });
  }

  async getResolvedConfig(id: string, user: Session) {
    const server = await this.getServerCached(id);

    if (
      !(await this.hasServerAccess(user, id, {
        any: ['server:manage', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    const [groupAdmins, serverAdmins, mergedEnvs] = await Promise.all([
      server.groupId
        ? this.prismaService.groupServerAdmin.findMany({ where: { groupId: server.groupId } })
        : Promise.resolve([] as GroupServerAdmin[]),
      this.prismaService.serverAuthority.findMany({
        where: { serverId: id },
      }),
      this.resolveGroupEnvs(server.groupId, id),
    ]);

    return {
      admins: [...groupAdmins, ...serverAdmins],
      envs: mergedEnvs,
    };
  }

  async updateAdmin(id: string, body: ApiBody<typeof api.v4.servers.admins.update>, user: Session) {
    const { userId, authorities } = body;

    const server = await this.getServerCached(id);

    if (
      !(await this.hasServerAccess(user, id, {
        any: ['server:manage', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    await this.clearServerAuthoritiesCache(id, userId);

    return await this.prismaService.serverAuthority.upsert({
      where: {
        serverId_userId: {
          serverId: id,
          userId,
        },
      },
      create: {
        serverId: id,
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
  }

  async deleteAdmin(id: string, adminId: string, user: Session) {
    const server = await this.getServerCached(id);

    if (
      !(await this.hasServerAccess(user, id, {
        any: ['server:manage', { authorId: server.createdBy }],
      }))
    ) {
      throw new ForbiddenException();
    }

    const result = await this.prismaService.serverAuthority.delete({
      where: {
        id: adminId,
        serverId: id,
      },
    });

    await this.clearServerAuthoritiesCache(id, result.userId);

    return result;
  }

  async getMyAuthorities(id: string, user: Session | null) {
    if (!user) {
      return [];
    }

    const server = await this.prismaService.server.findFirstOrThrow({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        authorities: {
          where: {
            userId: user.id,
          },
        },
        manager: {
          include: {
            authorities: {
              where: {
                userId: user.id,
              },
            },
          },
        },
      },
    });

    const serverAuth: string[] = server.authorities.flatMap((auth) => auth.authorities);
    const managerAuth: string[] = server.manager?.authorities?.flatMap((auth) => auth.authorities) ?? [];

    return [...new Set([...serverAuth, ...managerAuth])];
  }
}
