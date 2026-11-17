import { RedisService } from '@/services/redis/redis.service';
import { UserService } from '@/services/user/user.service';
import { UserWithRoleAndAuthority } from '@/types/types';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-discord';

@Injectable()
export class DiscordOauthStrategy extends PassportStrategy(Strategy, 'discord') {
  private readonly logger = new Logger(DiscordOauthStrategy.name);

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private redisService: RedisService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('auth.discord.clientId'),
      clientSecret: configService.getOrThrow<string>('auth.discord.clientSecret'),
      callbackURL: configService.getOrThrow<string>('auth.discord.callbackURL'),
      scope: ['identify', 'guilds.join'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<UserWithRoleAndAuthority> {
    const { id, displayName, avatar, username, name } = profile;

    let user = await this.userService.findUserByProviderId(id, 'discord');

    const data = {
      name: displayName ?? name ?? username,
      imageUrl: avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png` : '',
    };

    if (user) {
      user = await this.userService.updateUserByProviderId(id, 'discord', data);
    } else {
      user = await this.userService.createUser(id, 'discord', data);

      const botToken = this.configService.getOrThrow<string>('auth.discord.botToken');
      const guildId = this.configService.getOrThrow<string>('auth.discord.guildId');

      fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: _accessToken }),
        signal: AbortSignal.timeout(5000),
      })
        .then(async (res) => {
          if (!res.ok) {
            this.logger.error('Failed to add user:', await res.text());
          }
        })
        .catch((e) => this.logger.error(e));
    }

    return user;
  }
}
