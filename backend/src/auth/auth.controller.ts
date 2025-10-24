import { Controller, Get, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync-user')
  async syncUser(@Body() body: { email: string; name?: string; image?: string }) {
    // Called by NextAuth after Google sign-in to sync user to our database
    const user = await this.authService.syncUser(body.email, body.name, body.image);
    return user;
  }

  @Post('generate-token')
  async generateToken(@Body() body: { userId: string }) {
    // Generate JWT for a user (called by NextAuth after sync)
    const user = await this.authService.validateUser(body.userId);
    if (!user) {
      throw new Error('User not found');
    }
    const token = await this.authService.generateJwt(user);
    return { token };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    // User is available in req.user after Google strategy validates
    const user = req.user;

    // Generate JWT
    const jwt = await this.authService.generateJwt(user);

    // Redirect to frontend with JWT as query param
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${jwt}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    return user;
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    // Optional: Add any backend cleanup here
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/signin`);
  }
}
