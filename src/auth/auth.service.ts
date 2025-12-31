import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma';
import * as argon2 from 'argon2';
import { MailService } from 'src/mail/mail.service';
import { REDIS } from 'src/session/session.constants';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  accessToken: string;
  refreshToken?: string;
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
    private readonly mailService: MailService,
    @Inject(REDIS) private readonly redis: Redis,
    private readonly configService: ConfigService,
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

    const isPasswordValid = await argon2.verify(user.hashedPassword!, password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials!');

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );

    await this.updateRefreshTokenHash(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
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

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: null },
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
    const { accessToken, refreshToken } = await this.generateTokens(
      newUser.id,
      newUser.email,
    );

    await this.updateRefreshTokenHash(newUser.id, refreshToken);

    return { user: newUser, accessToken, refreshToken };
  }

  private async generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      // Access Token
      this.jwt.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN'),
      }),
      // Refresh Token
      this.jwt.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
    });
  }

  async refreshTokens(userId: number, oldRefreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const isMatch = await argon2.verify(
      user.hashedRefreshToken,
      oldRefreshToken,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Access Denied');
    }

    // Generate new access token
    const { accessToken } = await this.generateTokens(user.id, user.email);

    // Reuse the same refresh token (no rotation on every refresh)
    return {
      accessToken,
      refreshToken: oldRefreshToken,
    };
  }

  async handleOAuthLogin(oauthUser: any): Promise<AuthResponse> {
    let user = await this.prisma.user.findUnique({
      where: { email: oauthUser.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: oauthUser.email,
          name: `${oauthUser.firstName} ${oauthUser.lastName}`.trim(),
          avatar: oauthUser.picture,
          oauthProvider: oauthUser.provider,
          oauthProviderId: oauthUser.providerId,
        },
      });
    } else {
      // Update user's OAuth info if user already exists
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          oauthProvider: oauthUser.provider,
          oauthProviderId: oauthUser.providerId,
          avatar: oauthUser.picture,
        },
      });
    }

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );

    await this.updateRefreshTokenHash(user.id, refreshToken);
    return { user: user, accessToken, refreshToken };
  }
}
