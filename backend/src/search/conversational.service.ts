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
      this.logger.log(`Handling conversational query: "${query}" for user: ${userId}`);

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

      // Perform search to find relevant notes
      const searchResults = await this.searchService.hybridSearch(query, userId, 5);

      this.logger.log(`Found ${searchResults.length} search results`);

      // Build context from search results
      const context = searchResults.length > 0
        ? searchResults
            .map(r => `[Note: ${r.title}]\n${r.excerpt}`)
            .join('\n\n')
        : 'No notes found matching your query.';

      // Build conversation history
      const history = conversation.messages && conversation.messages.length > 0
        ? conversation.messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')
        : '';

      // Generate response with Vertex AI
      const systemPrompt = `You are ScribbleAI, an intelligent assistant helping users search and understand their notes.

${history ? `Previous conversation:\n${history}\n` : ''}

Relevant notes found:
${context}

User query: "${query}"

Provide a helpful response that:
1. Directly answers the user's question based on their notes
2. References specific notes by title when relevant
3. Is concise but informative (2-3 sentences)
4. If no relevant notes were found, suggest they create a note about this topic

Response:`;

      this.logger.log('Generating AI response...');
      const response = await this.vertexAi.generateResponse(systemPrompt);
      this.logger.log('AI response generated successfully');

      // Save messages
      await this.prisma.conversationMessage.createMany({
        data: [
          { conversationId: conversation.id, role: 'user', content: query },
          {
            conversationId: conversation.id,
            role: 'assistant',
            content: response,
            sources: searchResults.slice(0, 5).map(r => ({
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
      this.logger.error('Error stack:', error.stack);
      throw error;
    }
  }
}
