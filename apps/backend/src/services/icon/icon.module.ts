import { Module } from '@nestjs/common';
import { IconService } from './icon.service';
import { IconController } from './icon.controller';

@Module({
  controllers: [IconController],
  providers: [IconService],
})
export class IconModule {}
