import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';
import { ContentParserModule } from '@/services/content-parser/content-parser.module';
import { ItemService } from '@/services/item/item.service';
import { ImageProxyModule } from '@/services/image-proxy/image-proxy.module';
import { VerifyModule } from '@/services/verify/verify.module';

@Module({
  imports: [ContentParserModule, ImageProxyModule, VerifyModule],
  controllers: [MapController],
  providers: [MapService, ItemService],
  exports: [MapService],
})
export class MapModule {}
