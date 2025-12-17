import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { GeminiModule } from '../gemini/gemini.module';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskImageController } from './task-image.controller';
import { TaskImageService } from './task-image.service';

@Module({
  imports: [PrismaModule, GeminiModule],
  controllers: [TasksController, TaskImageController],
  providers: [TasksService, TaskImageService],
})
export class TasksModule {}
