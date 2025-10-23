import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { VertexAiService } from '../vertex-ai/vertex-ai.service';

export interface SearchResult {
  noteId: string;
  title: string;
  content: string;
  excerpt: string;
  score: number;
  similarity?: number;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private elasticsearch: ElasticsearchService,
    private vertexAi: VertexAiService,
  ) {}

  async hybridSearch(
    query: string,
    userId: string,
    limit: number = 10,
  ): Promise<SearchResult[]> {
    const startTime = Date.now();

    try {
      // Generate query embedding
      const queryEmbedding = await this.vertexAi.generateEmbedding(query);

      // Keyword search (BM25)
      const keywordResults = await this.elasticsearch.getClient().search({
        index: 'notes',
        body: {
          query: {
            bool: {
              must: [
                { term: { userId } },
                {
                  multi_match: {
                    query,
                    fields: ['title^3', 'content', 'tags^2'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                  },
                },
              ],
            },
          },
          size: 50,
        },
      });

      // Vector search
      const vectorResults = await this.elasticsearch.getClient().search({
        index: 'notes',
        body: {
          query: {
            bool: {
              must: [{ term: { userId } }],
              should: [
                {
                  script_score: {
                    query: { match_all: {} },
                    script: {
                      source: "cosineSimilarity(params.queryVector, 'content_embedding') + 1.0",
                      params: { queryVector: queryEmbedding },
                    },
                  },
                },
              ],
            },
          },
          size: 50,
        },
      });

      // Merge with RRF
      const merged = this.reciprocalRankFusion(
        keywordResults.hits.hits,
        vectorResults.hits.hits,
        { keywordWeight: 0.4, vectorWeight: 0.6 },
      );

      const executionTime = Date.now() - startTime;
      this.logger.log(`Hybrid search completed in ${executionTime}ms`);

      return merged.slice(0, limit).map(hit => ({
        noteId: hit._source.noteId,
        title: hit._source.title,
        content: hit._source.content,
        excerpt: this.createExcerpt(hit._source.content, query),
        score: hit._score,
      }));
    } catch (error) {
      this.logger.error('Hybrid search failed:', error.message);
      return [];
    }
  }

  private reciprocalRankFusion(keywordHits: any[], vectorHits: any[], weights: any) {
    const k = 60;
    const scoreMap = new Map();

    keywordHits.forEach((hit, rank) => {
      const rrfScore = weights.keywordWeight / (k + rank + 1);
      scoreMap.set(hit._id, {
        ...hit,
        _score: (scoreMap.get(hit._id)?._score || 0) + rrfScore,
      });
    });

    vectorHits.forEach((hit, rank) => {
      const rrfScore = weights.vectorWeight / (k + rank + 1);
      const existing = scoreMap.get(hit._id);
      scoreMap.set(hit._id, {
        ...hit,
        _score: (existing?._score || 0) + rrfScore,
      });
    });

    return Array.from(scoreMap.values()).sort((a, b) => b._score - a._score);
  }

  private createExcerpt(content: string, query: string, length: number = 200): string {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerContent.indexOf(lowerQuery);
    
    if (index === -1) {
      return content.substring(0, length) + (content.length > length ? '...' : '');
    }
    
    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 150);
    
    return (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
  }
}

