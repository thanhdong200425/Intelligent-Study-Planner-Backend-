import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import z from 'zod';
import { FileInterceptor } from '@nestjs/platform-express';
import { TaskImageService } from './task-image.service';
import { UserId } from 'src/common/user-id.decorator';

const UploadTaskImageSchema = z.object({
  additionalContext: z
    .string()
    .max(500, 'Additional context too long')
    .optional(),
});

type UploadTaskImageDto = z.infer<typeof UploadTaskImageSchema>;

@UseGuards(JwtAuthGuard)
@Controller('tasks/image')
export class TaskImageController {
  constructor(private readonly taskImageService: TaskImageService) {}

  @Post('preview-image-tasks')
  // UseInterceptors is a decorator that allows you to handle the file upload in a more convenient way
  @UseInterceptors(FileInterceptor('image'))
  async previewImageTasks(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadTaskImageDto,
    @UserId() userId: number,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const { additionalContext } = body;

    // Send image to Gemini
    const analysisResult = await this.taskImageService.handleSendImageToGemini(
      file,
      additionalContext,
    );

    return {
      tasks: analysisResult.tasks,
      message: 'Tasks previewed successfully',
      statusCode: HttpStatus.OK,
    };
  }
}
