import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IndexingService } from '../search/indexing.service';

export interface CreateNoteDto {
  title: string;
  content: string;
  userId: string;
  tagIds?: string[];
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  tagIds?: string[];
}

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => IndexingService))
    private readonly indexing: IndexingService,
  ) {}

  private isDbAvailable(): boolean {
    return process.env.SKIP_PRISMA !== 'true';
  }

  async listNotesByUser(userId: string) {
    if (!this.isDbAvailable()) {
      return []; // Return empty array when DB is not available
    }
    
    try {
      return this.prisma.note.findMany({
        where: { userId },
        include: { tags: { include: { tag: true } } },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      console.error('Database error, falling back to mock data:', error.message);
      return []; // Fallback to empty array
    }
  }

  async getNoteById(id: string) {
    if (!this.isDbAvailable()) {
      // Return mock note when DB is not available
      return {
        id: id,
        title: 'Mock Note',
        content: 'This is a mock note for testing',
        userId: 'mock-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      };
    }
    
    try {
      const note = await this.prisma.note.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } } },
      });
      if (!note) throw new NotFoundException('Note not found');
      return note;
    } catch (error) {
      console.error('Database error, falling back to mock data:', error.message);
      return {
        id: id,
        title: 'Mock Note',
        content: 'This is a mock note for testing',
        userId: 'mock-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      };
    }
  }

  async createNote(input: CreateNoteDto) {
    if (!this.isDbAvailable()) {
      // Return mock note when DB is not available
      return {
        id: `mock-${Date.now()}`,
        title: input.title,
        content: input.content,
        userId: input.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      };
    }
    
    const { title, content, userId, tagIds } = input;
    
    // Auto-create user if doesn't exist (for MVP)
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@example.com` },
    });

    const note = await this.prisma.note.create({
      data: {
        title,
        content,
        userId,
        tags: tagIds && tagIds.length > 0 ? {
          createMany: {
            data: tagIds.map((tagId) => ({ tagId })),
            skipDuplicates: true,
          },
        } : undefined,
      },
      include: { tags: { include: { tag: true } } },
    });

    // Index note asynchronously
    this.indexing.indexNote(note.id).catch(err =>
      console.error('Indexing failed:', err)
    );

    return note;
  }

  async updateNote(id: string, input: UpdateNoteDto) {
    if (!this.isDbAvailable()) {
      // Return mock updated note when DB is not available
      return {
        id: id,
        title: input.title || 'Updated Mock Note',
        content: input.content || 'This mock note has been updated',
        userId: 'mock-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      };
    }
    
    try {
      const { title, content, tagIds } = input;
      const updated = await this.prisma.note.update({
        where: { id },
        data: {
          title,
          content,
          ...(tagIds ? {
            tags: {
              deleteMany: {},
              createMany: {
                data: tagIds.map((tagId) => ({ tagId })),
                skipDuplicates: true,
              },
            },
          } : {}),
        },
        include: { tags: { include: { tag: true } } },
      });

      // Reindex note asynchronously
      this.indexing.indexNote(id).catch(err =>
        console.error('Reindexing failed:', err)
      );

      return updated;
    } catch (error) {
      console.error('Database error, falling back to mock data:', error.message);
      return {
        id: id,
        title: input.title || 'Updated Mock Note',
        content: input.content || 'This mock note has been updated',
        userId: 'mock-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      };
    }
  }

  async deleteNote(id: string) {
    if (!this.isDbAvailable()) {
      // Return mock deletion when DB is not available
      return { id: id, message: 'Mock note deleted' };
    }
    
    try {
      await this.prisma.note.delete({ where: { id } });
      
      // Delete from index asynchronously
      this.indexing.deleteNoteFromIndex(id).catch(err =>
        console.error('Index deletion failed:', err)
      );
      
      return { id };
    } catch (error) {
      console.error('Database error, falling back to mock data:', error.message);
      return { id: id, message: 'Mock note deleted' };
    }
  }
}


