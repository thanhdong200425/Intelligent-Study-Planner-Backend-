import {
  Controller,
  Get,
  UnauthorizedException,
  Headers,
  Post,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';

@Controller('session')
export class SessionController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async me(@Headers('x-session-id') sid: string) {
    if (!sid) throw new UnauthorizedException();
    const s = await this.prisma.session.findUnique({
      where: { id: Number(sid) },
      include: { user: true },
    });
    if (!s) throw new UnauthorizedException();

    const now = new Date();
    // check absolute expiration
    if (now > s.absoluteExpiresAt) throw new UnauthorizedException();

    await this.prisma.session.update({
      where: { id: Number(sid) },
      data: { lastActivityAt: now },
    });

    const { id, email } = s.user;
    return { user: { id, email } };
  }

  @Post('revoke')
  async revoke(@Headers('x-session-id') sid: string) {
    if (sid)
      await this.prisma.session
        .delete({ where: { id: Number(sid) } })
        .catch(() => {});
    return { ok: true };
  }
}
