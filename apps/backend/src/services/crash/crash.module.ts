import { Module } from '@nestjs/common';
import { OctokitModule } from '@/services/octokit/octokit.module';
import { CrashController } from './crash.controller';
import { CrashService } from './crash.service';
import { ModCatalogService } from './mod-catalog.service';

@Module({
  imports: [OctokitModule],
  controllers: [CrashController],
  providers: [CrashService, ModCatalogService],
  exports: [ModCatalogService],
})
export class CrashModule {}
