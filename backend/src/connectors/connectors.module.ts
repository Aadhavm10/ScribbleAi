import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { VertexAiModule } from '../vertex-ai/vertex-ai.module';
import { GoogleService } from './google.service';
import { ConnectorsController } from './connectors.controller';
import { SyncSchedulerService } from './sync-scheduler.service';

@Module({
  imports: [ConfigModule, PrismaModule, ElasticsearchModule, VertexAiModule],
  controllers: [ConnectorsController],
  providers: [GoogleService, SyncSchedulerService],
  exports: [GoogleService, SyncSchedulerService],
})
export class ConnectorsModule {}


