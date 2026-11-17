import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DiscordModule } from './discord/discord.module';
import { GoogleModule } from './google/google.module';
import { RoleModule } from '@/services/role/role.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [DiscordModule, GoogleModule, RoleModule],
})
export class AuthModule {}
