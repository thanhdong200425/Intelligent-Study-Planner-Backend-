import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma';
import * as argon2 from 'argon2';
import { SessionService } from 'src/session/session.service';
import { MailService } from 'src/mail/mail.service';
import { REDIS } from 'src/session/session.constants';
import Redis from 'ioredis';

interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  rawToken: string;
}

export interface BaseResponse {
  status: boolean;
  message?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
    private readonly mailService: MailService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  async register(
    email: string,
    password: string,
    name?: string,
  ): Promise<BaseResponse> {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (currentUser) throw new UnauthorizedException('User already exists');

    // Save to redis first
    const hashedPassword = await argon2.hash(password);
    const newUserKey = `new_user:${email}`;
    const newUserData = {
      email,
      hashedPassword,
      name: name || null,
    };
    const redisResult = await this.redis.hmset(
      newUserKey,
      newUserData as Record<string, string>,
    );
    if (redisResult !== 'OK') {
      throw new UnauthorizedException('Registration failed, please try again');
    }

    const otpSendResult = await this.mailService.sendOtp(email);

    if (!otpSendResult.status || !otpSendResult.code)
      throw new UnauthorizedException('Failed to send verification email');

    return {
      status: true,
      message: 'Registration successful, please verify your email',
    };
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

  async verifyRegistration(email: string, code: number): Promise<AuthResponse> {
    const isOtpValid = await this.mailService.verifyOtp(email, code);
    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid or expired OTP code');
    }

    const newUserKey = `new_user:${email}`;
    const newUserData = await this.redis.hgetall(newUserKey);
    if (!newUserData || !newUserData.hashedPassword) {
      throw new UnauthorizedException('Registration data not found or expired');
    }

    // Create user in the database
    const newUser = await this.prisma.user.create({
      data: {
        email: newUserData.email,
        hashedPassword: newUserData.hashedPassword,
        name: newUserData.name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    // Remove temporary data from Redis
    await this.redis.del(newUserKey);

    // Return session info
    const { rawToken } = await this.sessionService.issue(newUser.id.toString());

    return { user: newUser, rawToken };
  }
}
