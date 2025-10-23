import { Body, Controller, Post } from '@nestjs/common';
import { AiService, AiSummaryResult, AiRephraseResult, AiTasksResult } from './ai.service';

export interface SummarizeRequest {
  noteId: string;
  title: string;
  content: string;
}

export interface RephraseRequest {
  text: string;
  style: 'formal' | 'casual' | 'concise';
}

export interface ExtractTasksRequest {
  content: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('summarize')
  async summarize(@Body() body: SummarizeRequest): Promise<AiSummaryResult> {
    return this.aiService.summarizeNote(body.title, body.content);
  }

  @Post('rephrase')
  async rephrase(@Body() body: RephraseRequest): Promise<AiRephraseResult> {
    return this.aiService.rephraseText(body.text, body.style);
  }

  @Post('extract-tasks')
  async extractTasks(@Body() body: ExtractTasksRequest): Promise<AiTasksResult> {
    return this.aiService.extractTasks(body.content);
  }
}
