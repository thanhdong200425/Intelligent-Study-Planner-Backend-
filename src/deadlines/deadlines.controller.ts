import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DeadlinesService } from './deadlines.service';
import { CreateDeadlineDto, UpdateDeadlineDto } from './deadlines.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../common/user-id.decorator';

@UseGuards(JwtAuthGuard)
@Controller('deadlines')
export class DeadlinesController {
  constructor(private readonly deadlines: DeadlinesService) {}

  @Post()
  create(@UserId() userId: number, @Body() body: CreateDeadlineDto) {
    return this.deadlines.create(userId, {
      title: body.title,
      dueDate: new Date(body.dueDate),
      priority: body.priority ?? 'MEDIUM',
      course: { connect: { id: body.courseId } },
    } as any);
  }

  @Get()
  list(@UserId() userId: number, @Query('courseId') courseId?: string) {
    return this.deadlines.list(userId, courseId ? Number(courseId) : undefined);
  }

  @Put(':id')
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDeadlineDto,
  ) {
    const data: any = { ...body };
    if (body.dueDate) data.dueDate = new Date(body.dueDate);
    if (body.courseId) data.course = { connect: { id: body.courseId } };
    return this.deadlines.update(userId, id, data);
  }

  @Delete(':id')
  remove(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.deadlines.remove(userId, id);
  }
}