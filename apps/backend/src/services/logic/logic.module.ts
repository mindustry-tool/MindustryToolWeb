import { Module } from '@nestjs/common';
import { LogicService } from './logic.service';
import { LogicController } from './logic.controller';

@Module({
  controllers: [LogicController],
  providers: [LogicService],
})
export class LogicModule {}
