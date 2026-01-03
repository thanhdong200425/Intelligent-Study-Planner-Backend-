import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsString()
  @MinLength(1)
  feedbackType!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsString()
  @MinLength(1)
  subject!: string;

  @IsString()
  @MinLength(1)
  message!: string;
}
