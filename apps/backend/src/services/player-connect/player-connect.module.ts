import { Module } from '@nestjs/common';
import { PlayerConnectService } from './player-connect.service';
import { PlayerConnectController } from './player-connect.controller';
import { ProfanityModule } from '@/services/profanity/profanity.module';

@Module({
  imports: [ProfanityModule],
  controllers: [PlayerConnectController],
  providers: [PlayerConnectService],
})
export class PlayerConnectModule {}
