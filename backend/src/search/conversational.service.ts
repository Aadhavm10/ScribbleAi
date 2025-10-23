import { Injectable, Logger } from '@nestjs/common';
import { SearchService } from './search.service';
import { VertexAiService } from '../vertex-ai/vertex-ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationalService {
  private readonly logger = new Logger(ConversationalService.name);

  constructor(
    private searchService: SearchService,
    private vertexAi: VertexAiService,
    private prisma: PrismaService,
  ) {}

  async handleQuery(query: string, userId: string, conversationId?: string) {
    try {
      // Get or create conversation
      let conversation = conversationId
        ? await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } },
          })
        : await this.prisma.conversation.create({
            data: { userId, title: query.substring(0, 50) },
            include: { messages: true },
          });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Perform hybrid search
      const searchResults = await this.searchService.hybridSearch(query, userId, 10);

      // Build context from search results
      const context = searchResults
        .map(r => `[Note: ${r.title}]\n${r.excerpt}`)
        .join('\n\n');

      // Build conversation history
      const history = conversation.messages
        ? conversation.messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')
        : '';

      // Generate response with Gemini
      const systemPrompt = `You are ScribbleAI, an intelligent assistant helping users search their notes.
Provide clear, conversational responses that:
1. Directly answer the user's question
2. Cite specific notes using [Note: "Title"]
3. Are concise but informative
4. Offer to provide more details if needed

Conversation history:
${history}

Relevant notes found:
${context}

User query: "${query}"

Response:`;

      const response = await this.vertexAi.generateResponse(systemPrompt);

      // Save messages
      await this.prisma.conversationMessage.createMany({
        data: [
          { conversationId: conversation.id, role: 'user', content: query },
          {
            conversationId: conversation.id,
            role: 'assistant',
            content: response,
            sources: searchResults.map(r => ({
              noteId: r.noteId,
              title: r.title,
              excerpt: r.excerpt,
            })),
          },
        ],
      });

      return {
        response,
        sources: searchResults.slice(0, 5),
        conversationId: conversation.id,
      };
    } catch (error) {
      this.logger.error('Conversational query failed:', error.message);
      throw error;
    }
  }
}

