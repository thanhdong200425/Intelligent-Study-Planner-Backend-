import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma';
import * as argon2 from 'argon2';
import { SessionService } from 'src/session/session.service';

interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  rawToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
  ) {}

  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResponse> {
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
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    const { rawToken } = await this.sessionService.issue(user.id.toString());

    return { user, rawToken };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
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

    const { rawToken } = await this.sessionService.issue(user.id.toString());

    return {
      rawToken,
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
