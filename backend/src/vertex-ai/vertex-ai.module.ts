import { Module, Global } from '@nestjs/common';
import { VertexAiService } from './vertex-ai.service';

@Global()
@Module({
  providers: [VertexAiService],
  exports: [VertexAiService],
})
export class VertexAiModule {}

