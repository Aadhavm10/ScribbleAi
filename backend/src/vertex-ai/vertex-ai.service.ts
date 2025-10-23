import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VertexAI } from '@google-cloud/vertexai';

@Injectable()
export class VertexAiService {
  private readonly logger = new Logger(VertexAiService.name);
  private vertexAI: VertexAI;
  private geminiModel: any;

  constructor(private configService: ConfigService) {
    const projectId = this.configService.get('GCP_PROJECT_ID');
    const location = this.configService.get('VERTEX_AI_LOCATION');

    if (!projectId || !location) {
      this.logger.warn('Vertex AI not configured. AI features will use mock responses.');
      return;
    }

    try {
      this.vertexAI = new VertexAI({
        project: projectId,
        location: location,
      });

      this.geminiModel = this.vertexAI.preview.getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });

      this.logger.log('Vertex AI initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Vertex AI:', error.message);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.vertexAI) {
      this.logger.warn('Vertex AI not available, returning mock embedding');
      // Return mock 768-dimensional embedding
      return Array(768).fill(0).map(() => Math.random());
    }

    try {
      // Use text-embedding-004 model via Vertex AI
      // For now, return mock embeddings until proper SDK integration
      this.logger.warn('Using mock embeddings - integrate proper Vertex AI SDK');
      return Array(768).fill(0).map(() => Math.random());
    } catch (error) {
      this.logger.error('Embedding generation failed:', error.message);
      // Return mock embedding on error
      return Array(768).fill(0).map(() => Math.random());
    }
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    if (!this.geminiModel) {
      this.logger.warn('Gemini not available, returning mock response');
      return 'I found relevant information in your notes. (Mock response - Vertex AI not configured)';
    }

    try {
      const fullPrompt = context 
        ? `Context:\n${context}\n\nUser Query: ${prompt}`
        : prompt;
      
      const result = await this.geminiModel.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Gemini generation failed:', error.message);
      return 'I found relevant information in your notes, but encountered an error generating the response.';
    }
  }
}

