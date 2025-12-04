import { PartialType } from '@nestjs/swagger';
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

export class UpdateTimerSessionDto extends PartialType(CreateTimerSessionDto) {
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;
}
