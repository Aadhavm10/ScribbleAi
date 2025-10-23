import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    if (process.env.SKIP_PRISMA === 'true') {
      this.logger.warn('Skipping Prisma connection (SKIP_PRISMA=true)');
      return;
    }

    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error.message);
      if (process.env.NODE_ENV === 'production') {
        this.logger.warn('Continuing without database connection in production');
        return;
      }
      throw error;
    }
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    // Close Nest app gracefully when Prisma exits
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}


