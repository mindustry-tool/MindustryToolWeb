import { Module } from '@nestjs/common';
import { StatsModule } from '@/services/stats/stats.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [StatsModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
