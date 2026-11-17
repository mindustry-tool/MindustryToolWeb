import { Module } from '@nestjs/common';
import { PluginService } from './plugin.service';
import { PluginController } from './plugin.controller';
import { OctokitModule } from '@/services/octokit/octokit.module';

@Module({
  controllers: [PluginController],
  providers: [PluginService],
  imports: [OctokitModule],
  exports: [PluginService],
})
export class PluginModule {}
