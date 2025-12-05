import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateEventTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #3b82f6)',
  })
  color?: string;
}

export class UpdateEventTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #3b82f6)',
  })
  color?: string;
}
