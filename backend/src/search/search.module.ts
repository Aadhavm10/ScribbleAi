import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ConversationalService } from './conversational.service';
import { IndexingService } from './indexing.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, ConversationalService, IndexingService],
  exports: [IndexingService],
})
export class SearchModule {}

