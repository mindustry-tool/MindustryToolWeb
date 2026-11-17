import { Module } from '@nestjs/common';
import { ModService } from './mod.service';
import { ModController } from './mod.controller';
import { OctokitModule } from '@/services/octokit/octokit.module';

@Module({
  controllers: [ModController],
  providers: [ModService],
  imports: [OctokitModule],
})
export class ModModule {}
