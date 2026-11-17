import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordOauthStrategy } from '@/services/auth/discord/discord.strategy';
import { UserService } from '@/services/user/user.service';
import { AuthService } from '@/services/auth/auth.service';
import { RoleModule } from '@/services/role/role.module';

@Module({
  controllers: [DiscordController],
  providers: [DiscordOauthStrategy, UserService, AuthService],
  imports: [RoleModule],
})
export class DiscordModule {}
