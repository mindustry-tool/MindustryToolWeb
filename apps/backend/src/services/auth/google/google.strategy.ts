import { RedisService } from '@/services/redis/redis.service';
import { UserService } from '@/services/user/user.service';
import { UserWithRoleAndAuthority } from '@/types/types';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleOauthStrategy.name);

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private redisService: RedisService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('auth.google.clientId'),
      clientSecret: configService.getOrThrow<string>('auth.google.clientSecret'),
      callbackURL: configService.getOrThrow<string>('auth.google.callbackURL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<UserWithRoleAndAuthority> {
    const { id, displayName, photos } = profile;

    let user = await this.userService.findUserByProviderId(id, 'google');

    const data = {
      name: displayName,
      imageUrl: photos && photos.length > 0 ? photos[0].value : '',
    };

    if (user) {
      user = await this.userService.updateUserByProviderId(id, 'google', data);
    } else {
      user = await this.userService.createUser(id, 'google', data);
    }

    return user;
  }
}
