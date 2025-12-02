import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS
  const corsOrigins = process.env.NODE_ENV === 'production'
    ? ['https://scribbly-ai.vercel.app', 'https://scribble-ai-ten.vercel.app', /\.vercel\.app$/]
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', /^http:\/\/localhost:\d+$/];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3002;
  await app.listen(port, '0.0.0.0'); // Bind to 0.0.0.0 for Railway/Docker
  console.log(`🚀 Application is running on port ${port}`);
  console.log(`📝 CORS enabled for: ${corsOrigins}`);
  console.log(`📝 SKIP_PRISMA value: "${process.env.SKIP_PRISMA}"`);
  console.log(`📝 Database mode: ${process.env.SKIP_PRISMA === 'true' ? 'MOCK DATA' : 'REAL DATABASE'}`);
}
bootstrap();
