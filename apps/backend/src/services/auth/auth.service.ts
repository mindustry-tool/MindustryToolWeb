import { PrismaService } from '@/prisma/prisma.service';
import { MemoryCacheService } from '@/services/memory-cache/memory-cache.service';
import { RedisService } from '@/services/redis/redis.service';
import {
  generateSessionByUser,
  sha256,
  getSessionKey,
  getSessionOrNull,
  generateSessionToken,
} from '@/utils/auth.utils';
import { api } from '@mindustry-tool/api';
import { ApiResult } from '@mindustry-tool/api';
import { Session, sessionSchema } from '@mindustry-tool/api';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Request, Response } from 'express';

@Injectable()
export class AuthService {
  private LOGIN_ID_EXPIRE_AFTER = 5 * 60 * 1000;

  private readonly logger = new Logger(AuthService.name);

  private readonly APP_ISSUER: string;
  private readonly APP_JWT_PASSWORD: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly memoryCacheService: MemoryCacheService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {
    this.APP_JWT_PASSWORD = this.configService.getOrThrow<string>('auth.jwt.password');
    this.APP_ISSUER = this.configService.getOrThrow<string>('url.frontend');
  }

  async handle(req: Request, res: Response) {
    const session = getSessionOrNull(req);

    if (!session) {
      return res.redirect(`${this.configService.get('url.frontend')}`);
    }

    const { token } = generateSessionByUser(session);

    const hashedToken = sha256(token);
    const key = getSessionKey({ userId: session.id, hashedToken });

    const _30DaysInSeconds = 60 * 60 * 24 * 30;

    await this.redisService.setSession(key, session);

    const config: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      domain: this.configService.get('domain'),
      path: '/',
      expires: new Date(Date.now() + _30DaysInSeconds * 1000),
    };

    res.cookie('st', token, config).cookie('uid', session.id, config);

    const redirectUrl = this.configService.getOrThrow('url.frontend') + '/redirect';

    //TODO: Go to /redirect
    return res.redirect(`${redirectUrl}`);
  }

  async generateLoginUrl() {
    const loginId = generateSessionToken();
    const loginUrl = `${this.configService.get('url.frontend')}/auth/app/login?loginId=${loginId}`;

    const promise = new Promise<ApiResult<typeof api.v4.auth.app.loginToken>>((resolve, reject) => {
      this.memoryCacheService.set(`login:callback:${loginId}`, { resolve, reject }, this.LOGIN_ID_EXPIRE_AFTER);
    }).catch((error) => {
      this.logger.error(error);
    });

    this.memoryCacheService.set(`login:result:${loginId}`, promise, this.LOGIN_ID_EXPIRE_AFTER);

    return {
      loginId,
      loginUrl,
    };
  }

  async getLoginToken(loginId: string) {
    const result = await this.memoryCacheService.get<Promise<ApiResult<typeof api.v4.auth.app.loginToken>>>(
      `login:result:${loginId}`,
    );

    if (result === undefined) {
      throw new BadRequestException('Invalid login id: ' + loginId);
    }

    this.memoryCacheService.delete(`login:result:${loginId}`);
    this.memoryCacheService.delete(`login:callback:${loginId}`);

    return result;
  }

  async login(loginId: string, user: Session) {
    const login = this.memoryCacheService.get<{
      resolve: (value: ApiResult<typeof api.v4.auth.app.loginToken>) => void;
      reject: (reason?: any) => void;
    }>(`login:callback:${loginId}`);

    if (login === undefined) {
      throw new BadRequestException('Invalid login id:' + loginId);
    }

    try {
      const session: Session = {
        ...user,
        authorities: [],
      };

      const { accessToken, refreshToken } = await this.generateToken(session);

      login.resolve({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      login.reject(error);
    }
  }

  async logout(refreshToken: string, user: Session) {
    await this.redisService.invalidateRefreshToken(refreshToken, user);
  }

  async generateToken(session: Session) {
    session = sessionSchema.parse(session);

    let accessToken: string;
    let refreshToken: string;

    try {
      accessToken = this.jwtService.sign(session, {
        secret: this.APP_JWT_PASSWORD,
        expiresIn: '5m',
        issuer: this.APP_ISSUER,
      });

      refreshToken = this.jwtService.sign(session, {
        secret: this.APP_JWT_PASSWORD,
        expiresIn: '30d',
        issuer: this.APP_ISSUER,
      });
    } catch (error) {
      this.logger.error('Generate token failed: ' + JSON.stringify(session), error);
      throw new InternalServerErrorException();
    }

    await this.redisService.setRefreshToken(refreshToken, session);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    let session: Session;

    try {
      session = this.jwtService.verify<Session>(refreshToken, {
        secret: this.APP_JWT_PASSWORD,
        issuer: this.APP_ISSUER,
      });
    } catch (error) {
      this.logger.warn('Failed to verify token', error);
      throw new UnauthorizedException("Fail to verify refresh token");
    }

    const savedSession = await this.redisService.getRefreshToken(refreshToken, session);

    if (savedSession === null) {
      throw new UnauthorizedException('Token expired');
    }

    const user = await this.prismaService.user.findUniqueOrThrow({
      where: {
        id: session.id,
      },
    });

    if (user.bannedUntil && user.bannedUntil > new Date()) {
      throw new ForbiddenException('User banned until ' + user.bannedUntil.toString());
    }

    await this.redisService.invalidateRefreshToken(refreshToken, savedSession);

    return await this.generateToken(session);
  }
}
