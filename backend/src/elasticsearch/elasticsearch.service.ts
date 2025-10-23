import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;
  private readonly indexName = 'notes';

  constructor(private configService: ConfigService) {
    const elasticsearchUrl = this.configService.get('ELASTICSEARCH_URL');
    const apiKey = this.configService.get('ELASTICSEARCH_API_KEY');

    this.client = new Client({
      node: elasticsearchUrl,
      auth: {
        apiKey: apiKey,
      },
      tls: {
        rejectUnauthorized: false, // For development
      },
    });
  }

  async onModuleInit() {
    try {
      await this.createIndex();
    } catch (error) {
      this.logger.error('Failed to initialize Elasticsearch:', error.message);
    }
  }

  async createIndex() {
    try {
      const exists = await this.client.indices.exists({ index: this.indexName });
      
      if (!exists) {
        // Serverless-compatible index creation (no shards/replicas settings)
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                noteId: { type: 'keyword' },
                userId: { type: 'keyword' },
                title: {
                  type: 'text',
                  analyzer: 'standard',
                  fields: { keyword: { type: 'keyword' } },
                },
                content: { type: 'text', analyzer: 'standard' },
                tags: { type: 'keyword' },
                content_embedding: {
                  type: 'dense_vector',
                  dims: 768,
                  index: true,
                  similarity: 'cosine',
                },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
                viewCount: { type: 'integer' },
                lastViewedAt: { type: 'date' },
              },
            },
          },
        });
        this.logger.log('Elasticsearch index created successfully (serverless mode)');
      } else {
        this.logger.log('Elasticsearch index already exists');
      }
    } catch (error) {
      this.logger.error('Failed to create Elasticsearch index:', error.message);
      // Don't throw - allow app to start even if index creation fails
      this.logger.warn('Continuing without Elasticsearch index...');
    }
  }

  getClient(): Client {
    return this.client;
  }
}

