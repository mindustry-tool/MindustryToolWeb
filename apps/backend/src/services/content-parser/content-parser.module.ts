import { Module } from '@nestjs/common';
import { ContentParserService } from './content-parser.service';
import { ContentParserController } from './content-parser.controller';

@Module({
  controllers: [ContentParserController],
  providers: [ContentParserService],
  exports: [ContentParserService],
})
export class ContentParserModule {}
