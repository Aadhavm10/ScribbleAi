import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cron from 'node-cron';
import { GoogleService } from './google.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SyncSchedulerService.name);
  private syncTask: cron.ScheduledTask | null = null;

  constructor(
    private configService: ConfigService,
    private googleService: GoogleService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    const isMockMode = this.configService.get<string>('SKIP_PRISMA') === 'true';
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    if (isMockMode) {
      this.logger.warn('Sync scheduler disabled in mock mode');
      return;
    }

    if (!isProduction) {
      this.logger.warn('Sync scheduler disabled in development mode. Enable manually in production.');
      return;
    }

    // Schedule sync every 6 hours: 0 */6 * * *
    // For hackathon/demo: run every hour: 0 * * * *
    this.syncTask = cron.schedule('0 * * * *', () => {
      this.logger.log('Running scheduled sync for all users...');
      this.syncAllUsers();
    });

    this.logger.log('Sync scheduler initialized: running every hour');
  }

  async syncAllUsers() {
    try {
      // Get all users with connected Google accounts
      const sourceAccounts = await this.prisma.sourceAccount.findMany({
        where: { provider: 'google' },
        select: { userId: true },
      });

      const uniqueUserIds = [...new Set(sourceAccounts.map(acc => acc.userId))];

      this.logger.log(`Syncing ${uniqueUserIds.length} users...`);

      for (const userId of uniqueUserIds) {
        try {
          const stats = await this.googleService.sync(userId, ['gmail', 'drive', 'docs']);
          this.logger.log(`Synced user ${userId}: Gmail=${stats.gmail}, Drive=${stats.drive}, Docs=${stats.docs}`);
        } catch (error) {
          this.logger.error(`Failed to sync user ${userId}: ${error.message}`);
        }
      }

      this.logger.log('Scheduled sync completed');
    } catch (error) {
      this.logger.error(`Scheduled sync failed: ${error.message}`);
    }
  }

  // Manual trigger for testing
  async triggerManualSync() {
    this.logger.log('Manual sync triggered');
    await this.syncAllUsers();
  }
}

