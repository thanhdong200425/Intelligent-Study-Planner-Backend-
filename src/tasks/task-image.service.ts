import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GeminiService } from 'src/gemini/gemini.service';
import { TaskArray } from 'src/gemini/types';
import { TasksService } from './tasks.service';
import { Prisma, Task } from '@prisma/client';
import { CreateTaskDto } from './tasks.dto';

@Injectable()
export class TaskImageService {
  constructor(
    private readonly geminiService: GeminiService,
    private logger: Logger,
    private readonly tasksService: TasksService,
  ) {}

  validateFile(file: Express.Multer.File): boolean {
    if (!file) throw new BadRequestException('No file uploaded');

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype))
      throw new BadRequestException(
        'Invalid file type. Allowed types: jpeg, png, jpg',
      );

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize)
      throw new BadRequestException('File size exceeds 10MB');
    return true;
  }

  async handleSendImageToGemini(
    file: Express.Multer.File,
    additionalContext?: string,
  ): Promise<TaskArray> {
    try {
      this.validateFile(file);

      const analysisResult = await this.geminiService.analyzeImageForTasks(
        file.buffer,
        file.mimetype,
        additionalContext,
      );

      return analysisResult;
    } catch (error) {
      this.logger.error('Error analyzing image for tasks', error);
      throw new InternalServerErrorException('Error analyzing image for tasks');
    }
  }

  async handleCreateTasksFromAnalysis(
    analysisResult: TaskArray,
    userId: number,
  ): Promise<Task[] | null> {
    try {
      const createdTasks = await this.tasksService.addMultiple(
        userId,
        analysisResult.tasks as CreateTaskDto[],
      );

      return createdTasks;
    } catch (error) {
      this.logger.error('Error creating tasks from analysis', error);
      throw new InternalServerErrorException(
        'Error creating tasks from analysis',
      );
    }
  }
}
