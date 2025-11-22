import { Controller, Get, Query, Res } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import type { Response } from 'express';

@Controller('spotify/auth')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('login')
  login(@Res() res: Response) {
    const url = this.spotifyService.getLoginUrl();
    res.redirect(url);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).send('Code is missing');
    }

    try {
      const data = await this.spotifyService.requestAccessToken(code);
      // In a real app, you might want to store this token in a session or return it to the frontend
      // For now, we'll just return it as JSON or redirect to frontend with token
      // res.redirect(`http://localhost:3000/?access_token=${data.access_token}`);
      return res.json(data);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to get access token' });
    }
  }
}
