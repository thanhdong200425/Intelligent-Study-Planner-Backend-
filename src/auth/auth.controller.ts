import { Body, Controller, Delete, Get, Post, Req, Res, UseGuards, } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './jwt.guard';
import { UserId } from '../common/user-id.decorator';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../session/session.service';
import { RefreshTokenGuard } from './refresh-token.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { GithubOAuthGuard } from './guards/github-oauth.guard';

interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  statusCode: number;
  accessToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.auth.login(body.email, body.password);

    // Set httpOnly cookie that middleware can read
    this.sessionService.setRefreshTokenCookie(res, result.refreshToken!);

    return {
      user: result.user,
      statusCode: 200,
      accessToken: result.accessToken,
    };
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const result = await this.auth.register(
      body.email,
      body.password,
      body.name,
    );

    return {
      status: result.status,
      statusCode: 200,
    };
  }

  @Post('register/verify-otp')
  async verifyOtpForRegistration(
    @Body('email') email: string,
    @Body('otp') otp: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.auth.verifyRegistration(email, otp);

    this.sessionService.setRefreshTokenCookie(res, result.refreshToken!);

    return {
      user: result.user,
      statusCode: 200,
      accessToken: result.accessToken,
    };
  }

  @Post('check-type')
  checkAuthType(@Body('email') email: string) {
    return this.auth.checkAuthType(email);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Req() req: Request & { user?: { sub: number; refreshToken: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req?.user; // From RefreshTokenStrategy

    if (!user) throw new Error('User not found in request');

    const result = await this.auth.refreshTokens(user.sub, user.refreshToken);

    // Set new httpOnly refresh token cookie
    this.sessionService.setRefreshTokenCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
    };
  }

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  // passthrough = true =>  Allows NestJS to still handle the response automatically
  async logout(
    @UserId() userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.logout(userId);

    // Clear the cookie
    this.sessionService.clearRefreshTokenCookie(res);

    return result;
  }

  // OAuth routes
  // Google OAuth routes
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    // Initiates the Google OAuth flow
    // The guard automatically redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    // After Google authenticates, this is called
    const result = await this.auth.handleOAuthLogin(req.user);

    // Set httpOnly cookie that middleware can read (same as login flow)
    this.sessionService.setRefreshTokenCookie(res, result.refreshToken!);

    // Redirect to frontend with only access token (refresh token secured in cookie)
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${result.accessToken}`,
    );
  }

  // GitHub OAuth routes
  @Get('github')
  @UseGuards(GithubOAuthGuard)
  async githubAuth() {
    // Initiates the GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(GithubOAuthGuard)
  async githubAuthCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.auth.handleOAuthLogin(req.user);

    // Set httpOnly cookie that middleware can read (same as login flow)
    this.sessionService.setRefreshTokenCookie(res, result.refreshToken!);

    // Redirect to frontend with only access token (refresh token secured in cookie)
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${result.accessToken}`,
    );
  }
}
