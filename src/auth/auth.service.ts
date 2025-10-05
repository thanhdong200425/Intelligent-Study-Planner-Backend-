import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma';
import * as argon2 from 'argon2';
import { addDays } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (currentUser) throw new UnauthorizedException('User already exists');

    const hashedPassword = await argon2.hash(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        hashedPassword,
        name,
      },
    });
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    return { access_token: accessToken, userId: user.id };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ 
    sessionId: number; 
    absoluteSeconds: number;
    user: { id: number; email: string; name: string | null };
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        hashedPassword: true,
      },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials!');

    const isPasswordValid = await argon2.verify(user.hashedPassword, password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials!');

    const now = new Date();
    const absDays = 14;
    const expireDate = addDays(now, absDays);
    const newSession = await this.prisma.session.create({
      data: {
        userId: user.id,
        lastActivityAt: now,
        absoluteExpiresAt: expireDate,
      },
      select: { id: true },
    });

    return { 
      sessionId: newSession.id,
      absoluteSeconds: absDays * 24 * 3600,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async checkAuthType(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user ? 'login' : 'register';
  }

  async logout(userId: number, sessionId: number) {
    await this.prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId: userId,
      },
    });
    return { success: true };
  }
}
