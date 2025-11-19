import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, data: Prisma.AvailabilityWindowCreateInput) {
    return this.prisma.availabilityWindow.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  list(userId: number) {
    return this.prisma.availabilityWindow.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async remove(userId: number, id: number) {
    const existing = await this.prisma.availabilityWindow.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException('Availability window not found');
    await this.prisma.availabilityWindow.delete({ where: { id } });
    return { success: true };
  }
}
