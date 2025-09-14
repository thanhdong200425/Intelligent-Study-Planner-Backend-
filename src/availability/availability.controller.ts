import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { IsInt, IsString, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UserId } from '../common/user-id.decorator';

class CreateAvailabilityDto {
  @IsInt() @Min(0) @Max(6) dayOfWeek!: number;
  @IsString() startTime!: string; // HH:MM
  @IsString() endTime!: string;   // HH:MM
}

@UseGuards(JwtAuthGuard)
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Post()
  create(@UserId() userId: number, @Body() body: CreateAvailabilityDto) {
    return this.availability.create(userId, {
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      endTime: body.endTime,
      user: { connect: { id: userId } },
    } as any);
  }

  @Get()
  list(@UserId() userId: number) {
    return this.availability.list(userId);
  }

  @Delete(':id')
  remove(@UserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.availability.remove(userId, id);
  }
}