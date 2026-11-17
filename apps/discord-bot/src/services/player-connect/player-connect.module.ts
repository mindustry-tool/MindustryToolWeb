import { Module } from '@nestjs/common';
import { PlayerConnectService } from './player-connect.service';

@Module({
  providers: [PlayerConnectService],
  exports: [PlayerConnectService],
})
export class PlayerConnectModule {}
