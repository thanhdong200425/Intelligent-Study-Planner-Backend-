import { Injectable } from '@nestjs/common';
import { TimerSession, TimerSessionType } from '@prisma/client';
import { PrismaService } from 'src/prisma';
import { UpdateTimerSessionDto } from './timer-session.dto';

interface CreateTimerSessionData {
  userId: number;
  taskId: number | null;
  timeBlockId: number | null;
  data: {
    type: TimerSessionType;
    startTime: Date;
  };
}

@Injectable()
export class TimerSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    userId,
    taskId,
    timeBlockId,
    data,
  }: CreateTimerSessionData): Promise<TimerSession> {
    return await this.prisma.timerSession.create({
      data: {
        user: { connect: { id: userId } },
        ...(taskId ? { task: { connect: { id: taskId } } } : {}),
        ...(timeBlockId ? { timeBlock: { connect: { id: timeBlockId } } } : {}),
        ...data,
      },
    });
  }

  async update(id: number, data: UpdateTimerSessionDto): Promise<TimerSession> {
    return await this.prisma.timerSession.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async getTodaySessions(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.prisma.timerSession.findMany({
      where: {
        userId,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        task: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async getActiveSession(userId: number): Promise<TimerSession | null> {
    return await this.prisma.timerSession.findFirst({
      where: {
        userId,
        status: 'active',
      },
      include: {
        task: {
          include: {
            course: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }
}
