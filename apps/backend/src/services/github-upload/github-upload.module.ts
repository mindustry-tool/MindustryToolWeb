import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GitHubUploadController } from './github-upload.controller';
import { GitHubUploadService } from './github-upload.service';
import { GitHubUploadCron } from './github-upload.cron';
import { SchematicsModule } from '@/services/schematic/schematics.module';
import { MapModule } from '@/services/map/map.module';
import { OctokitModule } from '@/services/octokit/octokit.module';

@Module({
  imports: [PrismaModule, SchematicsModule, MapModule, OctokitModule],
  controllers: [GitHubUploadController],
  providers: [GitHubUploadService, GitHubUploadCron],
  exports: [GitHubUploadService],
})
export class GitHubUploadModule {}
