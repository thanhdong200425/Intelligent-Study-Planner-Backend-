import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { DeadlinesService } from './deadlines.service';
import { DeadlinePriority } from '@prisma/client';

class CreateDeadlineDto {
  @IsString() @MinLength(1) title!: string;
  @IsInt() courseId!: number;
  @IsDateString() dueDate!: string;
  @IsOptional() @IsEnum(DeadlinePriority) priority?: DeadlinePriority;
}

class UpdateDeadlineDto {
  @IsOptional() @IsString() @MinLength(1) title?: string;
  @IsOptional() @IsInt() courseId?: number;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsOptional() @IsEnum(DeadlinePriority) priority?: DeadlinePriority;
  @IsOptional() @IsBoolean() completed?: boolean;
}

@Controller('deadlines')
export class DeadlinesController {
  constructor(private readonly deadlines: DeadlinesService) {}

  @Post()
  create(@Query('userId') userId: string, @Body() body: CreateDeadlineDto) {
    return this.deadlines.create(Number(userId ?? 1), {
      title: body.title,
      dueDate: new Date(body.dueDate),
      priority: body.priority ?? 'MEDIUM',
      course: { connect: { id: body.courseId } },
    } as any);
  }

  @Get()
  list(@Query('userId') userId: string, @Query('courseId') courseId?: string) {
    return this.deadlines.list(Number(userId ?? 1), courseId ? Number(courseId) : undefined);
  }

  @Put(':id')
  update(
    @Query('userId') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDeadlineDto,
  ) {
    const data: any = { ...body };
    if (body.dueDate) data.dueDate = new Date(body.dueDate);
    if (body.courseId) data.course = { connect: { id: body.courseId } };
    return this.deadlines.update(Number(userId ?? 1), id, data);
  }

  @Delete(':id')
  remove(@Query('userId') userId: string, @Param('id', ParseIntPipe) id: number) {
    return this.deadlines.remove(Number(userId ?? 1), id);
  }
}