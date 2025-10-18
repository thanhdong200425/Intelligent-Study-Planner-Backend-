import { IsDateString, IsInt, IsString, Min, MinLength } from 'class-validator';

export class CreateHabitDto {
  @IsString() @MinLength(1) name!: string;
  @IsInt() @Min(1) targetMinutes!: number;
}

export class CheckInDto {
  @IsDateString() date!: string; // YYYY-MM-DD
  @IsInt() @Min(1) minutes!: number;
}
