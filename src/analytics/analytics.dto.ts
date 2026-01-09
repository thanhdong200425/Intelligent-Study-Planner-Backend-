export class AnalyticsStatsDto {
  studyHoursThisWeek: number;
  studyHoursGrowthRate: number;
  coursesEnrolled: number;
  totalStudyHours: number;
  totalStudyHoursGrowthRate: number;
  taskCompletionRate: number;
}

export class WeeklyStudyHoursDto {
  day: string;
  hours: number;
}

export class TaskDistributionDto {
  name: string;
  value: number;
  color: string;
}

export class StudyTimeByCourseDto {
  course: string;
  hours: number;
}
