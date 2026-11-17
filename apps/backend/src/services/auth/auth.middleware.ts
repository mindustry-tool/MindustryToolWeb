import { RedisService } from '@/services/redis/redis.service';
import { getSessionKey, sha256 } from '@/utils/auth.utils';
import { Session, sessionSchema } from '@mindustry-tool/api';
import { BadRequestException, Injectable, Logger, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly APP_ISSUER: string;
  private readonly APP_JWT_PASSWORD: string;
  private readonly DOMAIN: string | undefined;

  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    private redisService: RedisService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.APP_JWT_PASSWORD = this.configService.getOrThrow<string>('auth.jwt.password');
    this.APP_ISSUER = this.configService.getOrThrow<string>('url.frontend');
    this.DOMAIN = this.configService.get<string>('domain');
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token: unknown = req.cookies['st'];
    const userId: unknown = req.cookies['uid'];
    let session: Session | undefined;

    if (authHeader) {
      session = this.handleJwtToken(authHeader);
    } else if (token && userId) {
      let isExpired = false;

      try {
        const result = await this.handleSessionToken(token, userId);

        if (result) {
          isExpired = result.isExpired;
          session = result.data;
        }
      } catch (error) {
        this.logger.debug('Fail to handle session token', error);
        this.clearSessionCookies(res);
      }

      if (isExpired) {
        this.clearSessionCookies(res);
        throw new UnauthorizedException('Session expired');
      }
    }

    if (session && session.bannedUntil && session.bannedUntil > new Date()) {
      throw new UnauthorizedException(`You has been banned until ${session.bannedUntil.toString()}`);
    }

    req.user = session;

    return next();
  }

  private clearSessionCookies(res: Response) {
    // Must specify domain so it matches the cookie originally set in auth.service.ts handle()
    res.clearCookie('st');
    res.clearCookie('uid');
    if (this.DOMAIN) {
      res.clearCookie('st', { domain: this.DOMAIN });
      res.clearCookie('uid', { domain: this.DOMAIN });
    }
  }

  private handleJwtToken(authHeader: string) {
    const token = this.getAuthToken(authHeader);

    if (token === null) {
      return undefined;
    }

    try {
      const session = this.jwtService.verify<Session>(token, {
        secret: this.APP_JWT_PASSWORD,
        issuer: this.APP_ISSUER,
      });

      return sessionSchema.parse({ ...session, authorities: [] } satisfies Session);
    } catch (error) {
      this.logger.debug(`Invalid token: ${String(error)}`);
      throw new UnauthorizedException('Fail to verify token');
    }
  }

  private async handleSessionToken(token: unknown, userId: unknown){
    if (typeof token !== 'string' || token.length === 0) {
      this.logger.debug(`Invalid token: ${token as any}`);
      return undefined;
    }

    if (typeof userId !== 'string' || userId.length === 0) {
      this.logger.debug(`Invalid user id: ${userId as any}`);
      return undefined;
    }

    const hashesToken = sha256(token);
    const key = getSessionKey({ userId, hashedToken: hashesToken });

    return await this.redisService.getSession(key);
  }

  private getAuthToken(header: string) {
    try {
      const [bearer, token] = header.split(' ');
      if ('Bearer' !== bearer) {
        return null;
      }

      return token;
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException('Invalid token');
    }
  }
}
