import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class DeadlinesService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, data: Prisma.DeadlineCreateInput) {
    return this.prisma.deadline.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        course: { connect: { id: (data as any).course?.connect?.id } },
      },
    });
  }

  list(userId: number, courseId?: number) {
    return this.prisma.deadline.findMany({
      where: { userId, ...(courseId ? { courseId } : {}) },
      orderBy: { dueDate: 'asc' },
    });
  }

  async update(userId: number, id: number, data: Prisma.DeadlineUpdateInput) {
    const existing = await this.prisma.deadline.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Deadline not found');
    return this.prisma.deadline.update({ where: { id }, data });
  }

  async remove(userId: number, id: number) {
    const existing = await this.prisma.deadline.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Deadline not found');
    await this.prisma.deadline.delete({ where: { id } });
    return { success: true };
  }
}