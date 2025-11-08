import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UserId } from '../common/user-id.decorator';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Post()
  create(@UserId() userId: number, @Body() dto: CreateCourseDto) {
    return this.courses.create(userId, {
      name: dto.name,
      color: dto.color,
    } as any);
  }

  @Get()
  list(@UserId() userId: number) {
    return this.courses.findAll(userId);
  }

  @Put(':id')
  update(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courses.update(userId, id, dto as any);
  }

  @Delete(':id')
  remove(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.courses.remove(userId, id);
  }
}
