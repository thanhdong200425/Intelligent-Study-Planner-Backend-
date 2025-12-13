import { Controller, Get, UseGuards } from '@nestjs/common';
import { TodayService } from './today.service';
import { UserId } from '../common/user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('today')
export class TodayController {
  constructor(private readonly todayService: TodayService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getToday(@UserId() userId: number) {
    return this.todayService.getToday(userId);
  }
}
