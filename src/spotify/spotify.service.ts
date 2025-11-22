import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SpotifyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  getLoginUrl(): string {
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
    ];
    const scope = scopes.join(' ');
    const state = this.generateRandomString(16);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://127.0.0.1:3000';
    const redirectUri = `${frontendUrl}/spotify/auth/callback`;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.configService.get<string>('SPOTIFY_CLIENT_ID') || '',
      scope: scope,
      redirect_uri: redirectUri,
      state: state,
    });

    return `https://accounts.spotify.com/authorize/?${params.toString()}`;
  }

  async requestAccessToken(code: string): Promise<any> {
    const clientId = this.configService.get<string>('SPOTIFY_CLIENT_ID');
    const clientSecret = this.configService.get<string>('SPOTIFY_CLIENT_SECRET');
    
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://127.0.0.1:3000';
    const redirectUri = `${frontendUrl}/spotify/auth/callback`;

    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(clientId + ':' + clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          authOptions.url,
          new URLSearchParams(authOptions.form),
          { headers: authOptions.headers },
        ),
      );
      return response.data;
    } catch (error) {
      console.error('Error requesting access token:', error.response?.data || error.message);
      throw error;
    }
  }

  private generateRandomString(length: number): string {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
