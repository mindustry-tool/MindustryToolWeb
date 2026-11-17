import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  controllers: [TagController],
  providers: [TagService],
  imports: [CacheModule.register({ namespace: 'tag' })],
})
export class TagModule {}
