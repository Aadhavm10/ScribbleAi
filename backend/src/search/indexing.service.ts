import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { VertexAiService} from '../vertex-ai/vertex-ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IndexingService {
  private readonly logger = new Logger(IndexingService.name);

  constructor(
    private elasticsearch: ElasticsearchService,
    private vertexAi: VertexAiService,
    private prisma: PrismaService,
  ) {}

  async indexNote(noteId: string) {
    try {
      const note = await this.prisma.note.findUnique({
        where: { id: noteId },
        include: { tags: { include: { tag: true } } },
      });

      if (!note) {
        throw new Error('Note not found');
      }

      // Generate embedding
      const embedding = await this.vertexAi.generateEmbedding(
        `${note.title}\n\n${note.content}`,
      );

      // Index to Elasticsearch
      await this.elasticsearch.getClient().index({
        index: 'notes',
        id: noteId,
        document: {
          noteId: note.id,
          userId: note.userId,
          title: note.title,
          content: note.content,
          tags: note.tags.map(t => t.tag.name),
          content_embedding: embedding,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          viewCount: note.viewCount || 0,
          lastViewedAt: note.lastViewedAt,
        },
        refresh: 'wait_for',
      });

      // Update Prisma
      await this.prisma.note.update({
        where: { id: noteId },
        data: { embedding: noteId, embeddingVersion: 1 },
      });

      this.logger.log(`Indexed note ${noteId} successfully`);
    } catch (error) {
      this.logger.error(`Failed to index note ${noteId}:`, error.message);
      // Don't throw - allow note creation to succeed even if indexing fails
    }
  }

  async bulkIndexNotes(userId: string) {
    try {
      const notes = await this.prisma.note.findMany({ where: { userId } });
      
      this.logger.log(`Starting bulk index of ${notes.length} notes for user ${userId}`);
      
      for (const note of notes) {
        await this.indexNote(note.id);
      }
      
      this.logger.log(`Bulk indexed ${notes.length} notes for user ${userId}`);
    } catch (error) {
      this.logger.error('Bulk indexing failed:', error.message);
      throw error;
    }
  }

  async deleteNoteFromIndex(noteId: string) {
    try {
      await this.elasticsearch.getClient().delete({
        index: 'notes',
        id: noteId,
      });
      this.logger.log(`Deleted note ${noteId} from index`);
    } catch (error) {
      this.logger.error(`Failed to delete note ${noteId} from index:`, error.message);
    }
  }
}

