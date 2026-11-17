import { Module, OnModuleInit } from '@nestjs/common';
import sharp from 'sharp';
import { ImageProxyService } from './image-proxy.service';
import { ImageProxyController } from './image-proxy.controller';
import { StorageModule } from '@/services/storage/storage.module';

@Module({
  controllers: [ImageProxyController],
  providers: [ImageProxyService],
  imports: [StorageModule],
  exports: [ImageProxyService],
})
export class ImageProxyModule implements OnModuleInit {
  constructor(private readonly imageProxyService: ImageProxyService) {}

  async onModuleInit() {
    sharp.concurrency(1);
    sharp.cache(false);
    await this.imageProxyService.ensureBuckets();
  }
}
