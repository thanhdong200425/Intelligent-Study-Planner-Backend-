import { PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  title!: string;

  // ISO date string (YYYY-MM-DD)
  @IsDateString()
  date!: string;

  // HH:MM (24h) strings from frontend
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @IsOptional()
  @IsInt()
  eventTypeId?: number;

  @IsOptional()
  @IsInt()
  taskId?: number | null;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}
