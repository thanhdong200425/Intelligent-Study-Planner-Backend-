import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { AuthService } from './auth.service';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class LoginOrRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  name?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password);
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.auth.register(body.email, body.password, body.name);
  }
}