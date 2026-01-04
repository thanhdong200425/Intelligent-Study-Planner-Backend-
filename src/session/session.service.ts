import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { REDIS } from './session.constants';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name, {
    timestamp: true,
  });
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  // Cookie helpers centralize cookie configuration used across controllers
  setRefreshTokenCookie(res: Response, refreshToken: string): void {
    try {
      const cookieName = this.configService.get<string>(
        'REFRESH_TOKEN_COOKIE_NAME',
      );
      res.cookie(cookieName!, refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        domain:
          process.env.NODE_ENV === 'production'
            ? process.env.COOKIE_DOMAIN || undefined
            : undefined,
        maxAge:
          Number(this.configService.get('SESSION_ABSOLUTE_TTL_SECONDS')) * 1000,
      });
    } catch (error) {
      console.error('Error setting session cookie', error);
    }
  }

  clearRefreshTokenCookie(res: Response): void {
    const cookieName = this.configService.get<string>(
      'REFRESH_TOKEN_COOKIE_NAME',
    );
    res.clearCookie(cookieName!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.COOKIE_DOMAIN || undefined
          : undefined,
    });
  }
}
