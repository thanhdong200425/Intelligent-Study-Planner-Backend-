import { Injectable } from '@nestjs/common';
import { TimerSession, TimerSessionType } from '@prisma/client';
import { PrismaService } from 'src/prisma';

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
}
