import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://scibblyai.vercel.app', 'https://frontend-12b5.vercel.app', 'https://scribbly-ai.vercel.app', 'https://scribbly-ai-*.vercel.app', /\.vercel\.app$/] 
      : [/localhost:\d+$/],
    credentials: true,
  });
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`🚀 Application is running on port ${port}`);
  console.log(`📝 SKIP_PRISMA value: "${process.env.SKIP_PRISMA}"`);
  console.log(`📝 Database mode: ${process.env.SKIP_PRISMA === 'true' ? 'MOCK DATA' : 'REAL DATABASE'}`);
}
bootstrap();
