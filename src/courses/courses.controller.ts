import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  // NOTE: userId is taken from query for now; replace with auth later
  @Post()
  create(@Query('userId') userId: string, @Body() dto: CreateCourseDto) {
    return this.courses.create(Number(userId ?? 1), { name: dto.name, color: dto.color } as any);
  }

  @Get()
  list(@Query('userId') userId: string) {
    return this.courses.findAll(Number(userId ?? 1));
  }

  @Put(':id')
  update(
    @Query('userId') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courses.update(Number(userId ?? 1), id, dto as any);
  }

  @Delete(':id')
  remove(@Query('userId') userId: string, @Param('id', ParseIntPipe) id: number) {
    return this.courses.remove(Number(userId ?? 1), id);
  }
}