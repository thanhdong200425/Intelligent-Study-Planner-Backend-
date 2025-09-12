import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService, private readonly prisma: PrismaService) {}

  async loginOrRegister(email: string) {
    const user = await this.prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload);
    return { access_token: accessToken, userId: user.id };
  }
}