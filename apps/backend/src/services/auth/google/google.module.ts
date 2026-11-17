import { Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleOauthStrategy } from '@/services/auth/google/google.strategy';
import { UserService } from '@/services/user/user.service';
import { AuthService } from '@/services/auth/auth.service';
import { RoleModule } from '@/services/role/role.module';

@Module({
  controllers: [GoogleController],
  providers: [GoogleOauthStrategy, UserService, AuthService],
  imports: [RoleModule],
})
export class GoogleModule {}
