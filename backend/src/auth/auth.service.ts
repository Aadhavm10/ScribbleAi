import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  name?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(profile: any): Promise<any> {
    const { id, emails, displayName, photos } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new Error('No email found in Google profile');
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: displayName,
          image: photos?.[0]?.value,
        },
      });
    } else {
      // Update user info if it changed
      user = await this.prisma.user.update({
        where: { email },
        data: {
          name: displayName,
          image: photos?.[0]?.value,
        },
      });
    }

    return user;
  }

  async generateJwt(user: any): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string): Promise<any> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async syncUser(email: string, name?: string, image?: string): Promise<any> {
    // Find or create user (called by NextAuth after Google sign-in)
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: name || null,
          image: image || null,
        },
      });
    } else {
      // Update user info if it changed
      user = await this.prisma.user.update({
        where: { email },
        data: {
          name: name || user.name,
          image: image || user.image,
        },
      });
    }

    return user;
  }
}
