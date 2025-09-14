import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { IsDateString, IsInt, IsString, Min, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../common/user-id.decorator';

class CreateHabitDto {
  @IsString() @MinLength(1) name!: string;
  @IsInt() @Min(1) targetMinutes!: number;
}

class CheckInDto {
  @IsDateString() date!: string; // YYYY-MM-DD
  @IsInt() @Min(1) minutes!: number;
}

@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habits: HabitsService) {}

  @Post()
  create(@UserId() userId: number, @Body() body: CreateHabitDto) {
    return this.habits.createHabit(userId, { name: body.name, targetMinutes: body.targetMinutes } as any);
  }

  @Get()
  list(@UserId() userId: number) {
    return this.habits.listHabits(userId);
  }

  @Post(':id/check-in')
  checkIn(
    @UserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CheckInDto,
  ) {
    return this.habits.checkIn(userId, id, new Date(body.date), body.minutes);
  }

  @Delete(':id')
  remove(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.habits.removeHabit(userId, id);
  }
}