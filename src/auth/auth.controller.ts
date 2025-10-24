import { Body, Controller, Delete, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './jwt.guard';
import { UserId } from '../common/user-id.decorator';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../session/session.service';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string | null;
  };
  statusCode: number;
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
  ): Promise<LoginResponse> {
    const result = await this.auth.login(body.email, body.password);

    // Set httpOnly cookie that middleware can read
    this.sessionService.setSessionCookie(res, result.rawToken);

    return {
      user: result.user,
      statusCode: 200,
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
  ) {
    const result = await this.auth.verifyRegistration(email, otp);

    this.sessionService.setSessionCookie(res, result.rawToken);

    return {
      user: result.user,
      statusCode: 200,
    };
  }

  @Post('check-type')
  checkAuthType(@Body('email') email: string) {
    return this.auth.checkAuthType(email);
  }

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  // passthrough = true =>  Allows NestJS to still handle the response automatically
  async logout(
    @UserId() userId: number,
    @Body('sessionId') sessionId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.logout(userId, sessionId);

    // Clear the cookie
    this.sessionService.clearSessionCookie(res);

    return result;
  }
}
