import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh', // Custom strategy name
) {
  constructor(private readonly configService: ConfigService) {
    const cookieName = configService.get<string>('REFRESH_TOKEN_COOKIE_NAME');

    if (!cookieName)
      throw new Error('REFRESH_TOKEN_COOKIE_NAME must be defined');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.[cookieName] as string | null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  validate(req: Request, payload: any): any {
    const cookieName = this.configService.get<string>(
      'REFRESH_TOKEN_COOKIE_NAME',
    );

    if (!cookieName)
      throw new Error('REFRESH_TOKEN_COOKIE_NAME must be defined');

    const refreshToken = req.cookies[cookieName] as string;
    console.log('Cookie name:', cookieName);
    console.log('All cookies:', req.cookies);
    console.log('Refresh token from cookie:', refreshToken ? 'present' : 'missing');
    console.log('Token payload:', payload);

    // The guard will attach { ...payload, refreshToken } to req.user
    return { ...payload, refreshToken };
  }
}
