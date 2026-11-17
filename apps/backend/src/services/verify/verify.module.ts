import { Module } from '@nestjs/common';
import { VerifyService } from './verify.service';
import { VerifyController } from './verify.controller';
import { StatsModule } from '@/services/stats/stats.module';
import { NotificationModule } from '@/services/notification/notification.module';

@Module({
  controllers: [VerifyController],
  providers: [VerifyService],
  imports: [StatsModule, NotificationModule],
  exports: [VerifyService],
})
export class VerifyModule {}
