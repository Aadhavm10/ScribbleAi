import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('dev')
export class DevController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('seed')
  async seed(@Body() body?: { userId?: string; email?: string }) {
    if (process.env.SKIP_PRISMA === 'true') {
      return { ok: false, message: 'SKIP_PRISMA=true - disable it to seed real DB.' };
    }
    const userId = body?.userId || 'demo-user';
    const email = body?.email || 'demo@example.com';

    await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email },
    });

    const existing = await this.prisma.note.findFirst({ where: { userId } });
    if (!existing) {
      await this.prisma.note.create({
        data: {
          id: 'seed-1',
          title: 'Welcome to ScribblyAi',
          content: 'Your first note. 🎉',
          userId,
        },
      });
    }

    return { ok: true, userId };
  }
}


