import { Inject, Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { REDIS } from './session.constants';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';

interface SessionData {
  userId: string;
  issuedAt: number;
  lastActivityAt: number;
  absoluteExpiresAt: number;
  rotationCount: number;
}

@Injectable()
export class SessionService {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) { }

  b64url(buf: Buffer) {
    return buf
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private key(hash: string) {
    const sessionKey = this.configService.get<string>('SESSION_COOKIE_NAME');
    if (!sessionKey) throw new Error('SESSION_COOKIE_NAME is not set');
    return `${sessionKey}:${hash}`;
  }

  private sha256(v: string) {
    return createHash('sha256').update(v).digest('hex');
  }

  private now() {
    return Date.now();
  }

  private async revoke(oldRaw: string) {
    if (!oldRaw) return;
    const hash = this.sha256(oldRaw);
    const key = this.key(hash);
    await this.redis.del(key).catch(() => {
      console.error(`Failed to revoke session ${hash}`);
    });
  }

  private idleTtl() {
    const idleTtl = this.configService.get<string>('SESSION_IDLE_TTL_SECONDS');
    if (!idleTtl) throw new Error('SESSION_IDLE_TTL_SECONDS is not set');
    return Number(idleTtl);
  }

  private absoluteTtl() {
    const absoluteTtl = this.configService.get<string>(
      'SESSION_ABSOLUTE_TTL_SECONDS',
    );
    if (!absoluteTtl)
      throw new Error('SESSION_ABSOLUTE_TTL_SECONDS is not set');
    return Number(absoluteTtl);
  }

  async issue(userId: string) {
    const raw = this.b64url(randomBytes(32)); // 256-bit token
    const hash = this.sha256(raw);

    const iat = this.now();
    const session: SessionData = {
      userId,
      issuedAt: iat,
      lastActivityAt: iat,
      absoluteExpiresAt: iat + this.absoluteTtl(),
      rotationCount: 0,
    };

    const key = this.key(hash);
    await this.redis.set(key, JSON.stringify(session), 'EX', this.idleTtl());
    return { rawToken: raw, tokenHash: hash, session };
  }

  async validateAndTouch(rawToken: string): Promise<SessionData | null> {
    if (!rawToken) return null;
    const hash = this.sha256(rawToken);
    const key = this.key(hash);
    const data = await this.redis.get(key);
    if (!data) return null;

    const sess: SessionData = JSON.parse(data);
    const now = this.now();
    if (now > sess.absoluteExpiresAt) {
      await this.redis.del(key);
      return null;
    }
    // rolling: update lastActivityAt + bump TTL
    sess.lastActivityAt = now;

    // multi() => start a transaction
    await this.redis
      .multi()
      .set(key, JSON.stringify(sess))
      .expire(key, this.idleTtl())
      .exec();

    return sess;
  }

  async rotate(oldRaw: string, userId: string) {
    await this.revoke(oldRaw);
    return this.issue(userId);
  }

  // Cookie helpers centralize cookie configuration used across controllers
  setSessionCookie(res: Response, rawToken: string): void {
    try {
      res.cookie('sid', rawToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: "none",
        path: '/',
        maxAge:
          Number(this.configService.get('SESSION_ABSOLUTE_TTL_SECONDS')) * 1000,
      });
    } catch (error) {
      console.error('Error setting session cookie', error);
    }
  }

  clearSessionCookie(res: Response): void {
    res.clearCookie('sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
}
