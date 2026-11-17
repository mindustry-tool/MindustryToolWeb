import { Module } from '@nestjs/common';
import { CommunityServerService } from './community-server.service';
import { CommunityServerController } from './community-server.controller';
import { CommunityServerSyncService } from './services/community-server-sync.service';
import { CommunityServerPingService } from './services/community-server-ping.service';
import { CommunityServerSnapshotService } from './services/community-server-snapshot.service';

@Module({
  controllers: [CommunityServerController],
  providers: [
    CommunityServerService,
    CommunityServerSyncService,
    CommunityServerPingService,
    CommunityServerSnapshotService,
  ],
  exports: [CommunityServerService],
})
export class CommunityServerModule {}
