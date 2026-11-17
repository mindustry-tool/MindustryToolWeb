import { Controller, Get, Logger, Res } from '@nestjs/common';
import { api } from '@mindustry-tool/api';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Route, routeHandler } from '@/decorators/route.decorator';
import { AuthService } from '@/services/auth/auth.service';

@Controller()
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}
  private logger = new Logger('Auth');

  @Route(api.v4.auth.session)
  session() {
    return routeHandler(api.v4.auth.session, async ({ user }) => {
      return user;
    });
  }

  @Get('auth/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('st');
    res.clearCookie('uid');

    res.clearCookie('st', {
      domain: this.configService.get('domain'),
    });
    res.clearCookie('uid', {
      domain: this.configService.get('domain'),
    });

    return res.redirect(this.configService.getOrThrow('url.frontend') + '/redirect');
  }

  @Route(api.v4.auth.app.loginUri)
  loginUri() {
    return routeHandler(api.v4.auth.app.loginUri, async () => this.authService.generateLoginUrl(), {
      limit: [30, 'minute'],
    });
  }

  @Route(api.v4.auth.app.loginToken)
  loginToken() {
    return routeHandler(api.v4.auth.app.loginToken, ({ query }) => this.authService.getLoginToken(query.loginId), {
      limit: [30, 'minute'],
    });
  }

  @Route(api.v4.auth.app.login)
  login() {
    return routeHandler(api.v4.auth.app.login, ({ body, user }) => this.authService.login(body.loginId, user), {
      filter: true,
      limit: [10, 'minute'],
    });
  }

  @Route(api.v4.auth.app.logout)
  logoutToken() {
    return routeHandler(api.v4.auth.app.logout, ({ body, user }) => this.authService.logout(body.refreshToken, user), {
      filter: true,
      limit: [20, 'minute'],
    });
  }

  @Route(api.v4.auth.app.refresh)
  refreshToken() {
    return routeHandler(api.v4.auth.app.refresh, ({ body }) => this.authService.refreshToken(body.refreshToken), {
      limit: [60, 'minute'],
    });
  }
}
