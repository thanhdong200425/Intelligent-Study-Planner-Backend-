import { Body, Controller, Delete, Get, Param, ParseEnumPipe, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { TaskType } from '@prisma/client';

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

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  create(@Query('userId') userId: string, @Body() body: CreateTaskDto) {
    return this.tasks.create(Number(userId ?? 1), {
      title: body.title,
      type: body.type,
      estimateMinutes: body.estimateMinutes,
      course: { connect: { id: body.courseId } },
      ...(body.deadlineId ? { deadline: { connect: { id: body.deadlineId } } } : {}),
    } as any);
  }

  @Get()
  list(@Query('userId') userId: string, @Query('status') status?: 'open' | 'completed') {
    return this.tasks.list(Number(userId ?? 1), status);
  }

  @Put(':id')
  update(
    @Query('userId') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateTaskDto,
  ) {
    const data: any = { ...body };
    if (body.courseId) data.course = { connect: { id: body.courseId } };
    if (typeof body.deadlineId !== 'undefined') {
      data.deadline = body.deadlineId ? { connect: { id: body.deadlineId } } : { disconnect: true };
    }
    return this.tasks.update(Number(userId ?? 1), id, data);
  }

  @Delete(':id')
  remove(@Query('userId') userId: string, @Param('id', ParseIntPipe) id: number) {
    return this.tasks.remove(Number(userId ?? 1), id);
  }
}