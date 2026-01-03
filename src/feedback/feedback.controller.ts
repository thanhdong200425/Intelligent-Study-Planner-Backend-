import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './feedback.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../common/user-id.decorator';

@UseGuards(JwtAuthGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('attachments', 10))
  async create(
    @UserId() userId: number,
    @Body() body: CreateFeedbackDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // In a production app, you would upload files to cloud storage (S3, etc.)
    // and store the URLs. For now, we'll just store the filenames.
    const attachments = files?.map((file) => file.originalname) || [];

    return this.feedbackService.create(userId, body, attachments);
  }

  @Get()
  findAll(@UserId() userId: number) {
    return this.feedbackService.findAll(userId);
  }
}
