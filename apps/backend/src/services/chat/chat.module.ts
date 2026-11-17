import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ProfanityModule } from '@/services/profanity/profanity.module';
import { UserModule } from '@/services/user/user.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [UserModule, ProfanityModule],
})
export class ChatModule {}
