import { Module } from '@nestjs/common';
import { ContentPatchesService } from './content-patches.service';
import { ContentPatchesController } from './content-patches.controller';
import { ItemModule } from '@/services/item/item.module';
import { VerifyModule } from '@/services/verify/verify.module';

@Module({
  controllers: [ContentPatchesController],
  providers: [ContentPatchesService],
  imports: [ItemModule, VerifyModule],
})
export class ContentPatchesModule {}
