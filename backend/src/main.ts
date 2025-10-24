import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://scribbly-ai.vercel.app', 'https://scribble-ai-ten.vercel.app', /\.vercel\.app$/] 
      : [/localhost:\d+$/],
    credentials: true,
  });
  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0'); // Bind to 0.0.0.0 for Railway/Docker
  console.log(`🚀 Application is running on port ${port}`);
  console.log(`📝 SKIP_PRISMA value: "${process.env.SKIP_PRISMA}"`);
  console.log(`📝 Database mode: ${process.env.SKIP_PRISMA === 'true' ? 'MOCK DATA' : 'REAL DATABASE'}`);
}
bootstrap();
