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
import { FoldersModule } from './folders/folders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ElasticsearchModule,
    VertexAiModule,
    NotesModule,
    AiModule,
    SearchModule,
    FoldersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
