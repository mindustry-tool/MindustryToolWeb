import { Injectable, Logger } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { PrismaService } from '@/prisma/prisma.service';

/** Resolves the manager id from an upgrade request's Bearer token. */
@Injectable()
export class ManagerAuthenticator {
  private readonly logger = new Logger(ManagerAuthenticator.name);

  constructor(private readonly prismaService: PrismaService) {}

  async authenticate(req: IncomingMessage): Promise<string | null> {
    this.logger.log(`Authenticating WS: ${req.url}`);

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('WS connection rejected: missing/malformed Authorization header');
      return null;
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      this.logger.warn('WS connection rejected: empty bearer token');
      return null;
    }

    const manager = await this.prismaService.serverManager
      .findFirst({ where: { accessToken: token } })
      .catch(() => null);

    if (!manager) {
      this.logger.warn('WS connection rejected: token not found in ServerManager table');
      return null;
    }

    return manager.id;
  }
}
