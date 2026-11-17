import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { ItemService } from '@/services/item/item.service';

@Module({
  controllers: [PostController],
  providers: [PostService, ItemService],
})
export class PostModule {}
