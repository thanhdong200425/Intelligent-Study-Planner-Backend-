import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TodayService {
  constructor(private readonly prisma: PrismaService) {}

  private startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private endOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private toDateKey(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  async getToday(userId: number) {
    const now = new Date();
    const start = this.startOfDay(now);
    const end = this.endOfDay(now);

    const tasksWithDeadlineToday = await this.prisma.task.findMany({
      where: {
        userId,
        completed: false,
        deadline: { dueDate: { gte: start, lte: end } },
      },
      include: { course: true, deadline: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    const openTasksNoDeadline = await this.prisma.task.findMany({
      where: { userId, completed: false, deadlineId: null },
      include: { course: true, deadline: true },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      take: 50,
    });

    const todaysTasks = tasksWithDeadlineToday.concat(openTasksNoDeadline);

    const upcomingDeadlines = await this.prisma.deadline.findMany({
      where: { userId, dueDate: { gte: now } },
      include: { course: true },
      orderBy: { dueDate: 'asc' },
      take: 3,
    });

    const tasksCompletedToday = await this.prisma.task.count({
      where: { userId, completed: true, updatedAt: { gte: start, lte: end } },
    });

    const totalOpenTasks = await this.prisma.task.count({
      where: { userId, completed: false },
    });

    const agg = await this.prisma.task.aggregate({
      _sum: { estimateMinutes: true },
      where: { userId, completed: false },
    });
    const timeRemaining = agg._sum.estimateMinutes || 0;

    const highPriorityCount = await this.prisma.task.count({
      where: { userId, completed: false, priority: 'high' },
    });

    const dayOfWeek = now.getDay();
    const availabilityToday = await this.prisma.availabilityWindow.findMany({
      where: { userId, dayOfWeek },
      orderBy: [{ startTime: 'asc' }],
    });

    const yearAgo = new Date(now);
    yearAgo.setDate(yearAgo.getDate() - 365);

    let streak = 0;

    return {
      todaysTasks,
      upcomingDeadlines,
      availabilityToday,
      stats: {
        tasksCompletedToday,
        totalOpenTasks,
        timeRemaining,
        highPriorityCount,
        dayStreak: streak,
      },
    };
  }
}
