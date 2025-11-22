import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../common/user-id.decorator';
import { Prisma } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  create(@UserId() userId: number, @Body() body: CreateTaskDto) {
    return this.tasks.create(userId, {
      title: body.title,
      type: body.type,
      estimateMinutes: body.estimateMinutes,
      priority: body.priority,
      ...(body.courseId ? { course: { connect: { id: body.courseId } } } : {}),
      ...(body.deadlineId
        ? { deadline: { connect: { id: body.deadlineId } } }
        : {}),
    } as any);
  }

  @Get()
  list(
    @UserId() userId: number,
    @Query('status') status?: 'open' | 'completed',
  ) {
    return this.tasks.list(userId, status);
  }

  @Put(':id')
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTaskDto,
  ) {
    const { courseId, deadlineId, ...updateData } = body;
    const data: Prisma.TaskUpdateInput = { ...updateData };
    if (courseId) data.course = { connect: { id: courseId } };
    if (typeof deadlineId !== 'undefined') {
      data.deadline = deadlineId
        ? { connect: { id: deadlineId } }
        : { disconnect: true };
    }
    return this.tasks.update(userId, id, data);
  }

  @Patch(':id/toggle-complete')
  toggleComplete(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.tasks.toggleComplete(userId, id);
  }

  @Delete(':id')
  remove(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.tasks.remove(userId, id);
  }
}
