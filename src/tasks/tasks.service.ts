import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, data: Prisma.TaskCreateInput) {
    return this.prisma.task.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        ...(data.course ? { course: data.course } : {}),
        ...(data.deadline ? { deadline: data.deadline } : {}),
      },
    });
  }

  list(userId: number, status?: 'open' | 'completed') {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(status ? { completed: status === 'completed' } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: number, id: number, data: Prisma.TaskUpdateInput) {
    const existing = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException('Task not found');
    return this.prisma.task.update({ where: { id }, data });
  }

  async remove(userId: number, id: number) {
    const existing = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException('Task not found');
    await this.prisma.task.delete({ where: { id } });
    return { success: true };
  }

  async toggleComplete(userId: number, id: number) {
    const existing = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException('Task not found');
    const result = await this.prisma.task.update({
      where: { id },
      data: { completed: !existing.completed },
    });

    return result.completed;
  }
}
