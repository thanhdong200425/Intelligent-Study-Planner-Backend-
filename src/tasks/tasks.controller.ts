import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { TaskType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../common/user-id.decorator';

class CreateTaskDto {
  @IsString() @MinLength(1) title!: string;
  @IsInt() courseId!: number;
  @IsEnum(TaskType) type!: TaskType;
  @IsInt() @Min(1) estimateMinutes!: number;
  @IsOptional() @IsInt() deadlineId?: number | null;
}

class UpdateTaskDto {
  @IsOptional() @IsString() @MinLength(1) title?: string;
  @IsOptional() @IsInt() courseId?: number;
  @IsOptional() @IsEnum(TaskType) type?: TaskType;
  @IsOptional() @IsInt() @Min(1) estimateMinutes?: number;
  @IsOptional() @IsInt() deadlineId?: number | null;
  @IsOptional() @IsBoolean() completed?: boolean;
}

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
      course: { connect: { id: body.courseId } },
      ...(body.deadlineId ? { deadline: { connect: { id: body.deadlineId } } } : {}),
    } as any);
  }

  @Get()
  list(@UserId() userId: number, @Query('status') status?: 'open' | 'completed') {
    return this.tasks.list(userId, status);
  }

  @Put(':id')
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTaskDto,
  ) {
    const data: any = { ...body };
    if (body.courseId) data.course = { connect: { id: body.courseId } };
    if (typeof body.deadlineId !== 'undefined') {
      data.deadline = body.deadlineId ? { connect: { id: body.deadlineId } } : { disconnect: true };
    }
    return this.tasks.update(userId, id, data);
  }

  @Delete(':id')
  remove(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.tasks.remove(userId, id);
  }
}