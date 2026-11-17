import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { DiscordOauthGuard } from '@/services/auth/discord/discord.guard';
import { Request, Response } from 'express';
import { AuthService } from '@/services/auth/auth.service';

@Controller('/auth/discord')
export class DiscordController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(DiscordOauthGuard)
  async discordAuth() {}

  @Get('callback')
  @UseGuards(DiscordOauthGuard)
  async discordAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.handle(req, res);
  }
}
