import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { DeadlinePriority } from '@prisma/client';

export class CreateDeadlineDto {
  @IsString() @MinLength(1) title!: string;
  @IsInt() courseId!: number;
  @IsDateString() dueDate!: string;
  @IsOptional() @IsEnum(DeadlinePriority) priority?: DeadlinePriority;
}

export class UpdateDeadlineDto {
  @IsOptional() @IsString() @MinLength(1) title?: string;
  @IsOptional() @IsInt() courseId?: number;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsEnum(DeadlinePriority) priority?: DeadlinePriority;
  @IsOptional() @IsBoolean() completed?: boolean;
}
