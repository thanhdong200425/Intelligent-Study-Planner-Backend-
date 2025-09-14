import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}

  async register(email: string, password: string, name?: string) {
    const hashedPassword = await argon2.hash(password);
    const user = await this.prisma.user.create({
      data: {
        email,
        hashedPassword,
        name,
      },
    });
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    return { access_token: accessToken, userId: user.id };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await argon2.verify(user.hashedPassword, password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    return { access_token: accessToken, userId: user.id };
  }
}