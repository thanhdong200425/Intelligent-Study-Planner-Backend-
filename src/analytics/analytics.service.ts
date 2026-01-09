import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { TimerSessionType } from '@prisma/client';
import {
  AnalyticsStatsDto,
  WeeklyStudyHoursDto,
  TaskDistributionDto,
  StudyTimeByCourseDto,
  FocusHoursHeatmapDto,
} from './analytics.dto';
import { startOfWeek, endOfWeek, subWeeks, getDay, subDays, format } from 'date-fns';

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

  async getWeeklyStudyHours(
    userId: number,
  ): Promise<WeeklyStudyHoursDto[]> {
    const now = new Date();
    const startOfThisWeek = startOfWeek(now);
    const endOfThisWeek = endOfWeek(now);

    // Get all focus timer sessions for this week
    const sessions = await this.prisma.timerSession.findMany({
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
        startTime: true,
        durationMinutes: true,
      },
    });

    // Group by day of week
    const dayMap = new Map<number, number>();

    sessions.forEach((session) => {
      const dayOfWeek = getDay(session.startTime); // 0 = Sunday, 1 = Monday, etc.
      const currentMinutes = dayMap.get(dayOfWeek) || 0;
      dayMap.set(dayOfWeek, currentMinutes + session.durationMinutes);
    });

    // Map to output format with day abbreviations
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: WeeklyStudyHoursDto[] = [];

    for (let i = 0; i < 7; i++) {
      const minutes = dayMap.get(i) || 0;
      const hours = Math.round((minutes / 60) * 10) / 10;
      result.push({
        day: dayNames[i],
        hours,
      });
    }

    return result;
  }

  async getTaskDistribution(userId: number): Promise<TaskDistributionDto[]> {
    // Get all tasks grouped by type
    const tasks = await this.prisma.task.groupBy({
      by: ['type'],
      where: {
        userId,
      },
      _count: {
        type: true,
      },
    });

    // Map to display names and colors
    const typeMap: Record<
      string,
      { name: string; color: string }
    > = {
      reading: { name: 'Reading', color: '#3b82f6' },
      coding: { name: 'Coding', color: '#8b5cf6' },
      writing: { name: 'Writing', color: '#10b981' },
      pset: { name: 'Pset', color: '#f59e0b' },
      other: { name: 'Others', color: '#6b7280' },
    };

    const result: TaskDistributionDto[] = tasks.map((task) => ({
      name: typeMap[task.type]?.name || task.type,
      value: task._count.type,
      color: typeMap[task.type]?.color || '#6b7280',
    }));

    return result;
  }

  async getStudyTimeByCourse(
    userId: number,
  ): Promise<StudyTimeByCourseDto[]> {
    // Get all focus timer sessions with course information
    const sessions = await this.prisma.timerSession.findMany({
      where: {
        userId,
        type: TimerSessionType.focus,
        endTime: {
          not: null,
        },
        taskId: {
          not: null,
        },
      },
      select: {
        durationMinutes: true,
        task: {
          select: {
            courseId: true,
            course: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Group by course
    const courseMap = new Map<number, { name: string; minutes: number }>();

    sessions.forEach((session) => {
      if (session.task?.course && session.task.courseId) {
        const courseId = session.task.course.id;
        const courseName = session.task.course.name;
        const current = courseMap.get(courseId) || {
          name: courseName,
          minutes: 0,
        };
        courseMap.set(courseId, {
          name: courseName,
          minutes: current.minutes + session.durationMinutes,
        });
      }
    });

    // Convert to array and sort by hours descending
    const result: StudyTimeByCourseDto[] = Array.from(courseMap.values())
      .map((course) => ({
        course: course.name,
        hours: Math.round((course.minutes / 60) * 10) / 10,
      }))
      .sort((a, b) => b.hours - a.hours);

    return result;
  }

  async getFocusHoursHeatmap(
    userId: number,
  ): Promise<FocusHoursHeatmapDto[]> {
    // Calculate date range: 364 days from today (52 complete weeks)
    const now = new Date();
    const startDate = subDays(now, 364);

    // Query completed focus sessions in range
    const sessions = await this.prisma.timerSession.findMany({
      where: {
        userId,
        type: TimerSessionType.focus,
        startTime: {
          gte: startDate,
          lte: now,
        },
        endTime: {
          not: null,
        },
      },
      select: {
        startTime: true,
        durationMinutes: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Group by date (YYYY-MM-DD) and sum minutes
    const dateMap = new Map<string, number>();

    sessions.forEach((session) => {
      const dateKey = format(session.startTime, 'yyyy-MM-dd');
      const currentMinutes = dateMap.get(dateKey) || 0;
      dateMap.set(dateKey, currentMinutes + session.durationMinutes);
    });

    // Generate complete 365-day array (even days with 0 hours)
    const result: FocusHoursHeatmapDto[] = [];

    for (let i = 0; i <= 364; i++) {
      const date = subDays(now, 364 - i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const minutes = dateMap.get(dateKey) || 0;
      const hours = Math.round((minutes / 60) * 10) / 10; // Round to 1 decimal

      result.push({
        date: dateKey,
        hours,
      });
    }

    return result;
  }
}
