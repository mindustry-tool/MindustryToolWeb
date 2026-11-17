import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleOauthGuard } from '@/services/auth/google/google.guard';
import { Request, Response } from 'express';
import { AuthService } from '@/services/auth/auth.service';

@Controller('/auth/google')
export class GoogleController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {}

  @Get('callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.handle(req, res);
  }
}
