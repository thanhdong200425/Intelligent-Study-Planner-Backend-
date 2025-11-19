import { TimerSessionType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';

export class CreateTimerSessionDto {
  @IsEnum(TimerSessionType)
  type!: TimerSessionType;

  @IsOptional()
  @IsInt()
  taskId: number | null;

  @IsOptional()
  @IsInt()
  timeBlockId: number | null;

  @IsDateString()
  startTime!: string;
}
