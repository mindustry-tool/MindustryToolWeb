import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GitHubUploadService } from './github-upload.service.js';


@Injectable()
export class GitHubUploadCron implements OnModuleInit {
  private readonly logger = new Logger(GitHubUploadCron.name);
  private isProcessing = false;

  constructor(private readonly gitHubUploadService: GitHubUploadService) {}

  /**
   * Process pending uploads every 10 minutes
   */
  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: 'processPendingUploads',
  })
  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    if (this.isProcessing) {
      this.logger.warn('Download processing already in progress, skipping...');
      return;
    }

    this.isProcessing = true;

    try {
      await this.gitHubUploadService.processPendingUploads();
    } catch (error) {
      this.logger.error('Failed to process downloads:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Clean up old files daily at 2 AM UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'cleanupOldFiles',
  })
  async cleanupOldFiles(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    this.logger.log('Starting cleanup of old upload files...');

    try {
      await this.gitHubUploadService.cleanupOldFiles(24 * 30); // 24 hours
      this.logger.log('File cleanup completed successfully');
    } catch (error) {
      this.logger.error('Failed to cleanup old files:', error);
    }
  }
}
