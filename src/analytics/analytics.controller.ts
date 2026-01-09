import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../common/user-id.decorator';
import {
  AnalyticsStatsDto,
  WeeklyStudyHoursDto,
  TaskDistributionDto,
  StudyTimeByCourseDto,
  FocusHoursHeatmapDto,
} from './analytics.dto';
import { AnalyticsService } from './analytics.service';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  getStats(@UserId() userId: number): Promise<AnalyticsStatsDto> {
    return this.analyticsService.getStats(userId);
  }

  @Get('weekly-study-hours')
  getWeeklyStudyHours(
    @UserId() userId: number,
  ): Promise<WeeklyStudyHoursDto[]> {
    return this.analyticsService.getWeeklyStudyHours(userId);
  }

  @Get('task-distribution')
  getTaskDistribution(
    @UserId() userId: number,
  ): Promise<TaskDistributionDto[]> {
    return this.analyticsService.getTaskDistribution(userId);
  }

  @Get('study-time-by-course')
  getStudyTimeByCourse(
    @UserId() userId: number,
  ): Promise<StudyTimeByCourseDto[]> {
    return this.analyticsService.getStudyTimeByCourse(userId);
  }

  @Get('focus-hours-heatmap')
  getFocusHoursHeatmap(
    @UserId() userId: number,
  ): Promise<FocusHoursHeatmapDto[]> {
    return this.analyticsService.getFocusHoursHeatmap(userId);
  }
}
