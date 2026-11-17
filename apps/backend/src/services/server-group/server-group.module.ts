import { Module } from '@nestjs/common';
import { ServerGroupService } from './server-group.service';
import { ServerGroupController } from './server-group.controller';
import { ServerModule } from '@/services/server/server.module';

@Module({
  controllers: [ServerGroupController],
  providers: [ServerGroupService],
  imports: [ServerModule],
})
export class ServerGroupModule {}
