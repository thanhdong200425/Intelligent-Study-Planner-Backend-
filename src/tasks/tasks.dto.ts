import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { TaskPriority, TaskType } from '@prisma/client';

export class CreateTaskDto {
  @IsString() @MinLength(1) title!: string;
  @IsOptional() @IsInt() courseId?: number;
  @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
  @IsEnum(TaskType) type!: TaskType;
  @IsInt() @Min(1) estimateMinutes!: number;
  @IsOptional() @IsInt() deadlineId?: number | null;
}

export class UpdateTaskDto {
  @IsOptional() @IsString() @MinLength(1) title?: string;
  @IsOptional() @IsInt() courseId?: number;
  @IsOptional() @IsEnum(TaskType) type?: TaskType;
  @IsOptional() @IsInt() @Min(1) estimateMinutes?: number;
  @IsOptional() @IsInt() deadlineId?: number | null;
  @IsOptional() @IsBoolean() completed?: boolean;
  @IsOptional() @IsEnum(TaskPriority) priority?: TaskPriority;
}
