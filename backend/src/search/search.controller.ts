import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { ConversationalService } from './conversational.service';

@Controller('search')
export class SearchController {
  constructor(
    private searchService: SearchService,
    private conversationalService: ConversationalService,
  ) {}

  @Post('hybrid')
  async hybridSearch(
    @Body() body: { query: string; userId: string; limit?: number },
  ) {
    return this.searchService.hybridSearch(body.query, body.userId, body.limit);
  }

  @Post('conversational')
  async conversationalSearch(
    @Body() body: { query: string; userId: string; conversationId?: string },
  ) {
    return this.conversationalService.handleQuery(
      body.query,
      body.userId,
      body.conversationId,
    );
  }

  @Get('suggestions')
  async getSuggestions(@Query('q') query: string, @Query('userId') userId: string) {
    // Simple implementation for now
    return { suggestions: [] };
  }
}

