import { Module } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { StatsModule } from '@/services/stats/stats.module';
import { NotificationModule } from '@/services/notification/notification.module';

@Module({
  controllers: [ShareController],
  providers: [ShareService],
  imports: [StatsModule, NotificationModule],
})
export class ShareModule {}
