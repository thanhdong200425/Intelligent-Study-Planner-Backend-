import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { IsDateString, IsInt, IsString, Min, MinLength } from 'class-validator';

class CreateHabitDto {
  @IsString() @MinLength(1) name!: string;
  @IsInt() @Min(1) targetMinutes!: number;
}

class CheckInDto {
  @IsDateString() date!: string; // YYYY-MM-DD
  @IsInt() @Min(1) minutes!: number;
}

@Controller('habits')
export class HabitsController {
  constructor(private readonly habits: HabitsService) {}

  @Post()
  create(@Query('userId') userId: string, @Body() body: CreateHabitDto) {
    return this.habits.createHabit(Number(userId ?? 1), { name: body.name, targetMinutes: body.targetMinutes } as any);
  }

  @Get()
  list(@Query('userId') userId: string) {
    return this.habits.listHabits(Number(userId ?? 1));
  }

  @Post(':id/check-in')
  checkIn(
    @Query('userId') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CheckInDto,
  ) {
    return this.habits.checkIn(Number(userId ?? 1), id, new Date(body.date), body.minutes);
  }

  @Delete(':id')
  remove(@Query('userId') userId: string, @Param('id', ParseIntPipe) id: number) {
    return this.habits.removeHabit(Number(userId ?? 1), id);
  }
}