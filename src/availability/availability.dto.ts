import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateAvailabilityDto {
  @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @IsString() startTime!: string; // HH:MM
  @IsString() endTime!: string; // HH:MM
}
