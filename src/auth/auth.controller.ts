import { Body, Controller, Post, Delete, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtAuthGuard } from './jwt.guard';
import { UserId } from '../common/user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(body.email, body.password);
    
    // Set httpOnly cookie that middleware can read
    res.cookie('sid', result.sessionId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: result.absoluteSeconds * 1000,
    });
    
    return result;
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.auth.register(body.email, body.password, body.name);
  }

  @Post('check-type')
  checkAuthType(@Body('email') email: string) {
    return this.auth.checkAuthType(email);
  }

  @Delete('logout')
  @UseGuards(JwtAuthGuard)
  // passthrough = true =>  Allows NestJS to still handle the response automatically
  async logout(@UserId() userId: number, @Body('sessionId') sessionId: number, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.logout(userId, sessionId);
    
    // Clear the cookie
    res.clearCookie('sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    return result;
  }
}
