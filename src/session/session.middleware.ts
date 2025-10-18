import { Injectable, NestMiddleware } from '@nestjs/common';
import { SessionService } from './session.service';
import { NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

declare global {
  namespace Express {
    interface Request {
      userInfo?: { id: string };
      sessionMeta?: { issuedAt: number; lastActivityAt: number };
    }
  }
}

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(
    private readonly sessionSvc: SessionService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: any, _res: any, next: NextFunction) {
    try {
      const sid = req.cookies?.[this.configService.get('SESSION_COOKIE_NAME')];
      if (!sid) return next();

      const sess = await this.sessionSvc.validateAndTouch(sid);
      if (sess) {
        req.user = { id: sess.userId };
        req.sessionMeta = {
          issuedAt: sess.issuedAt,
          lastActivityAt: sess.lastActivityAt,
        };
      }
    } catch {
      console.error('Error validating session in session middleware');
    } finally {
      next();
    }
  }
}
