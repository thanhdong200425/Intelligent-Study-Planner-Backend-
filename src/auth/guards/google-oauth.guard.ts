import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor() {
    super({
      accessType: 'offline', // Get refresh token
      prompt: 'select_account', // Force consent screen
    });
  }
}
