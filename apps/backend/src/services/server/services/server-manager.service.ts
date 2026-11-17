import { PrismaService } from '@/prisma/prisma.service';
import { ServerManager } from '@/generated/prisma/client';
import { api } from '@mindustry-tool/api';
import { ApiBody } from '@mindustry-tool/api';
import { ServerManagerJwtPayload, Session } from '@mindustry-tool/api';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class ServerManagerService {
  private readonly logger = new Logger(ServerManagerService.name);

  private readonly managerConnectionListeners: Array<(manager: ServerManager) => Promise<void> | void> = [];
  private readonly managerRefreshListeners: Array<() => Promise<void> | void> = [];

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  onManagerConnection(listener: (manager: ServerManager) => Promise<void> | void) {
    this.managerConnectionListeners.push(listener);
  }

  onManagerRefresh(listener: () => Promise<void> | void) {
    this.managerRefreshListeners.push(listener);
  }

  getAccessToken({ id, createdBy, securityKey }: ServerManager) {
    return this.jwtService.sign(
      {
        id,
        userId: createdBy,
      },
      {
        secret: securityKey,
      },
    );
  }

  extractServerAddress(address: string) {
    const noHttps = address.replace('https://', '').replace('http://', '');
    const lastIndexOf = noHttps.lastIndexOf(':');

    if (lastIndexOf === -1) {
      return noHttps;
    }

    return noHttps.substring(0, lastIndexOf);
  }

  async pingServerManager(address: string) {
    try {
      const response = await fetch(address, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Server response is not ok: ${response.statusText} ${await response.text()}`);
      }

      const data = await response.text();

      if (data !== 'pong') {
        throw new Error(`Invalid server response: ${data}`);
      }
    } catch (error) {
      throw new Error(`Server is not valid: ${String(error)}`);
    }
  }

  async requestConnection(token?: string) {
    if (!token) {
      throw new BadRequestException('Invalid token');
    }

    let payload: { id: string };

    try {
      payload = await this.jwtService.verifyAsync<{ id: string }>(token);
    } catch (error) {
      this.logger.error('Failed to verify token', error);
      throw new UnauthorizedException('Fail to verify token');
    }

    const { id } = payload;

    const manager = await this.prismaService.serverManager.findUniqueOrThrow({
      where: {
        id,
      },
    });

    for (const listener of this.managerConnectionListeners) {
      try {
        await listener(manager);
      } catch (error) {
        this.logger.error(`Failed to trigger manager connection listener for server ${manager.id}`, error);
      }
    }
  }

  async createServerManager(body: ApiBody<typeof api.v4.servers.managers.create>, user: Session) {
    const id = uuidv7();

    const { name, address } = body;

    const securityKey = randomBytes(32).toString('hex');
    const payload: ServerManagerJwtPayload = {
      id,
    };
    const accessToken = this.jwtService.sign(payload);

    const result = await this.prismaService.serverManager.create({
      data: {
        id,
        name,
        address,
        securityKey,
        accessToken,
        createdBy: user.id,
        createdAt: new Date(),
      },
    });

    for (const listener of this.managerRefreshListeners) {
      try {
        await listener();
      } catch (error) {
        this.logger.error(`Failed to trigger manager refresh listener for server ${id}`, error);
      }
    }

    return result;
  }

  async getFreeToUseServerManager() {
    return await this.prismaService.serverManager.findMany({
      where: {
        isFreeToUse: true,
      },
    });
  }

  async getMyServerManagers(user: Session) {
    return await this.prismaService.serverManager.findMany({
      where: {
        createdBy: user.id,
      },
    });
  }

  async getServerManager(id: string, user: Session) {
    return await this.prismaService.serverManager.findFirstOrThrow({
      where: {
        id,
        createdBy: user.id,
      },
    });
  }

  async isOwner(id: string, user: Session) {
    const server = await this.prismaService.server.findFirstOrThrow({
      where: { id },
      include: { manager: true },
    });

    return user.id === server.manager.createdBy;
  }

  async resetServerManager(id: string, user: Session) {
    await this.prismaService.serverManager.findFirstOrThrow({
      where: {
        id,
        createdBy: user.id,
      },
    });

    const securityKey = randomBytes(32).toString('hex');
    const payload: ServerManagerJwtPayload = {
      id,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    const result = await this.prismaService.serverManager.update({
      where: {
        id,
      },
      data: {
        securityKey,
        accessToken,
        updatedBy: user.id,
        updatedAt: new Date(),
      },
    });

    for (const listener of this.managerRefreshListeners) {
      try {
        await listener();
      } catch (error) {
        this.logger.error(`Failed to trigger manager refresh listener for server ${id}`, error);
      }
    }

    return result;
  }

  async findFreePort(id: string) {
    return await this.freePort(id);
  }

  async freePort(id: string) {
    await this.prismaService.serverManager.findFirstOrThrow({
      where: {
        id,
      },
    });

    const freePort = await this.prismaService.$queryRaw<
      {
        port_rank: number;
      }[]
    >`
	    SELECT port_rank
      FROM (
        SELECT
          s.*,
          DENSE_RANK() OVER (ORDER BY s.port ASC) + 15000 AS port_rank
        FROM "Server" s
        WHERE s."managerId" = ${id}::uuid
        AND s.port > 15000
      ) AS ranked
      WHERE ranked.port_rank > 0 AND ranked.port > 15000  AND ranked.port_rank != ranked.port
      ORDER BY ranked.port ASC
    `;

    const server = await this.prismaService.server.findFirst({
      where: {
        managerId: id,
      },
      orderBy: {
        port: 'desc',
      },
    });

    const port = server?.port;

    return parseInt(String(freePort[0]?.port_rank || 0)) || (port ? port + 1 : 15001);
  }
}
