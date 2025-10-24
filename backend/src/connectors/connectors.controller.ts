import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GoogleService } from './google.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('connect')
@UseGuards(JwtAuthGuard)
export class ConnectorsController {
  constructor(private readonly google: GoogleService) {}

  @Post('google')
  async connectGoogle(
    @Body() body: { accessToken: string; refreshToken: string; expiresAt: string; scopes?: string[] },
    @CurrentUser() user: any,
  ) {
    const { accessToken, refreshToken, expiresAt, scopes } = body;
    await this.google.upsertSourceAccount({
      userId: user.id,
      provider: 'google',
      accessToken,
      refreshToken,
      expiresAt,
      scopes: Array.isArray(scopes) ? scopes : [],
    });
    return { ok: true };
  }

  @Post('google/sync')
  async syncGoogle(
    @Body() body: { sources?: string[] },
    @CurrentUser() user: any,
  ) {
    const { sources } = body;
    const stats = await this.google.sync(user.id, sources);
    return { ok: true, stats };
  }
}


