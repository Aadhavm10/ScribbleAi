import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VertexAiService } from '../vertex-ai/vertex-ai.service';

export interface SearchResult {
  noteId: string;
  title: string;
  content: string;
  excerpt: string;
  score: number;
  similarity?: number;
  provider?: string;
  itemType?: string;
  webViewUrl?: string;
  snippet?: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private prisma: PrismaService,
    private vertexAi: VertexAiService,
  ) {}

  async hybridSearch(
    query: string,
    userId: string,
    limit: number = 10,
    providers?: string[],
  ): Promise<SearchResult[]> {
    const startTime = Date.now();

    try {
      this.logger.log(`Starting search for query: "${query}" by user: ${userId}`);

      // Simple database search - search in title and content
      const notes = await this.prisma.note.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { updatedAt: 'desc' },
      });

      this.logger.log(`Found ${notes.length} notes matching query`);

      const results: SearchResult[] = notes.map(note => ({
        noteId: note.id,
        title: note.title,
        content: note.content,
        excerpt: this.createExcerpt(note.content, query),
        score: 1.0,
        provider: 'notes',
        itemType: 'note',
      }));

      const executionTime = Date.now() - startTime;
      this.logger.log(`Search completed in ${executionTime}ms with ${results.length} results`);

      return results;
    } catch (error) {
      this.logger.error('Search failed:', error.message);
      this.logger.error('Error stack:', error.stack);
      // Return empty array instead of throwing
      return [];
    }
  }

  private createExcerpt(content: string, query: string, length: number = 200): string {
    if (!content) return '';

    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);

    if (index === -1) {
      // Query not found, return first 200 chars
      return content.substring(0, length) + (content.length > length ? '...' : '');
    }

    // Query found, return context around it
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 150);

    return (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
  }
}
