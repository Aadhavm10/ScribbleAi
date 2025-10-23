import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { IndexingService } from '../search/indexing.service';
import { PrismaService } from '../prisma/prisma.service';

async function bootstrap() {
  console.log('🚀 Starting bulk indexing...\n');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const indexing = app.get(IndexingService);
  const prisma = app.get(PrismaService);

  try {
    const users = await prisma.user.findMany();
    console.log(`📊 Found ${users.length} users\n`);
    
    for (const user of users) {
      console.log(`👤 Indexing notes for user: ${user.email}`);
      const notes = await prisma.note.findMany({ where: { userId: user.id } });
      console.log(`   📝 Found ${notes.length} notes`);
      
      if (notes.length > 0) {
        await indexing.bulkIndexNotes(user.id);
        console.log(`   ✅ Indexed ${notes.length} notes\n`);
      }
    }

    console.log('✨ Bulk indexing complete!');
  } catch (error) {
    console.error('❌ Bulk indexing failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();

