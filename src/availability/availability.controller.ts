import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { IsInt, IsString, Max, Min } from 'class-validator';

class CreateAvailabilityDto {
  @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @IsString() startTime!: string; // HH:MM
  @IsString() endTime!: string;   // HH:MM
}

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Post()
  create(@Query('userId') userId: string, @Body() body: CreateAvailabilityDto) {
    return this.availability.create(Number(userId ?? 1), {
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      endTime: body.endTime,
      user: { connect: { id: Number(userId ?? 1) } },
    } as any);
  }

  @Get()
  list(@Query('userId') userId: string) {
    return this.availability.list(Number(userId ?? 1));
  }

  @Delete(':id')
  remove(@Query('userId') userId: string, @Param('id', ParseIntPipe) id: number) {
    return this.availability.remove(Number(userId ?? 1), id);
  }
}