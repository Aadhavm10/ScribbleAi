import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { NotesModule } from './notes/notes.module';
import { AiModule } from './ai/ai.module';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { VertexAiModule } from './vertex-ai/vertex-ai.module';
import { SearchModule } from './search/search.module';
import { DevController } from './dev/dev.controller';
import { FoldersModule } from './folders/folders.module';
import { ConnectorsModule } from './connectors/connectors.module';
import { AuthModule } from './auth/auth.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ElasticsearchModule,
    VertexAiModule,
    AuthModule,
    NotesModule,
    AiModule,
    SearchModule,
    FoldersModule,
    ConnectorsModule,
    CalendarModule,
  ],
  controllers: [AppController, DevController],
  providers: [AppService],
})
export class AppModule {}
