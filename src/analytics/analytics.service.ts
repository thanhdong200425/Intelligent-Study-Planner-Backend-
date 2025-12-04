import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TimerSessionType } from '@prisma/client';
import { AnalyticsStatsDto } from './analytics.dto';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: number): Promise<AnalyticsStatsDto> {
    // Get date ranges
    const now = new Date();
    const startOfThisWeek = startOfWeek(now);
    const endOfThisWeek = endOfWeek(now);
    const startOfLastWeek = startOfWeek(subWeeks(now, 1));
    const endOfLastWeek = endOfWeek(subWeeks(now, 1));

    // 1. Study hours this week (from timer sessions)
    const thisWeekSessions = await this.prisma.timerSession.findMany({
      where: {
        userId,
        type: TimerSessionType.focus,
        startTime: {
          gte: startOfThisWeek,
          lte: endOfThisWeek,
        },
        endTime: {
          not: null,
        },
      },
      select: {
        durationMinutes: true,
      },
    });

    console.log('thisWeekSessions', thisWeekSessions);

    const studyHoursThisWeek =
      thisWeekSessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0,
      ) / 60;

    // 2. Last week's study hours for growth rate
    const lastWeekSessions = await this.prisma.timerSession.findMany({
      where: {
        userId,
        type: TimerSessionType.focus,
        startTime: {
          gte: startOfLastWeek,
          lte: endOfLastWeek,
        },
        endTime: {
          not: null,
        },
      },
      select: {
        durationMinutes: true,
      },
    });

    const studyHoursLastWeek =
      lastWeekSessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0,
      ) / 60;

    const studyHoursGrowthRate =
      studyHoursLastWeek > 0
        ? ((studyHoursThisWeek - studyHoursLastWeek) / studyHoursLastWeek) * 100
        : 0;

    // 3. Courses enrolled
    const coursesEnrolled = await this.prisma.course.count({
      where: { userId },
    });

    // 4. Total study hours (all time)
    const allTimeSessions = await this.prisma.timerSession.findMany({
      where: {
        userId,
        type: TimerSessionType.focus,
        endTime: {
          not: null,
        },
      },
      select: {
        durationMinutes: true,
      },
    });

    const totalStudyHours =
      allTimeSessions.reduce(
        (sum, session) => sum + session.durationMinutes,
        0,
      ) / 60;

    // 5. Total study hours 30 days ago for growth rate
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sessionsBeforeThirtyDays = await this.prisma.timerSession.findMany({
      where: {
        userId,
        type: TimerSessionType.focus,
        startTime: {
          lt: thirtyDaysAgo,
        },
        endTime: {
          not: null,
        },
      },
      select: {
        durationMinutes: true,
      },
    });

    const totalStudyHoursThirtyDaysAgo =
      sessionsBeforeThirtyDays.reduce(
        (sum, session) => sum + session.durationMinutes,
        0,
      ) / 60;

    const totalStudyHoursGrowthRate =
      totalStudyHoursThirtyDaysAgo > 0
        ? ((totalStudyHours - totalStudyHoursThirtyDaysAgo) /
            totalStudyHoursThirtyDaysAgo) *
          100
        : 0;

    // 6. Task completion rate
    const [totalTasks, completedTasks] = await Promise.all([
      this.prisma.task.count({ where: { userId } }),
      this.prisma.task.count({ where: { userId, completed: true } }),
    ]);

    const taskCompletionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      studyHoursThisWeek: Math.round(studyHoursThisWeek * 10) / 10,
      studyHoursGrowthRate: Math.round(studyHoursGrowthRate),
      coursesEnrolled,
      totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      totalStudyHoursGrowthRate: Math.round(totalStudyHoursGrowthRate),
      taskCompletionRate: Math.round(taskCompletionRate),
    };
  }
}
