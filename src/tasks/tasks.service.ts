import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Prisma } from '@prisma/client';
import { CreateTaskDto } from './tasks.dto';

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

  list(userId: number, status?: 'open' | 'completed', includeCourse?: boolean) {
    return this.prisma.task.findMany({
      where: {
        userId,
        ...(status ? { completed: status === 'completed' } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: includeCourse
        ? {
            course: {
              select: {
                name: true,
              },
            },
          }
        : {},
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

  async addMultiple(userId: number, data: CreateTaskDto[]) {
    const createdTasks = [];

    for (const task of data) {
      const createdTask = await this.create(userId, {
        title: task.title,
        type: task.type,
        priority: task.priority,
        estimateMinutes: task.estimateMinutes ?? 60,
        ...(task.description ? { description: task.description } : {}),
        ...(task.deadlineId
          ? { deadline: { connect: { id: task.deadlineId } } }
          : {}),
      } as any);

      createdTasks.push(createdTask);
    }

    return createdTasks.length > 0 ? createdTasks : null;
  }
}
