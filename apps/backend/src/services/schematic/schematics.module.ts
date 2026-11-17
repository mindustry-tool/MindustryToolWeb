import { Module } from '@nestjs/common';
import { SchematicService } from './schematics.service';
import { SchematicController } from './schematics.controller';
import { ItemService } from '@/services/item/item.service';
import { ContentParserModule } from '@/services/content-parser/content-parser.module';
import { ImageProxyModule } from '@/services/image-proxy/image-proxy.module';
import { VerifyModule } from '@/services/verify/verify.module';

@Module({
  imports: [ContentParserModule, ImageProxyModule, VerifyModule],
  controllers: [SchematicController],
  providers: [SchematicService, ItemService],
  exports: [SchematicService],
})
export class SchematicsModule {}
