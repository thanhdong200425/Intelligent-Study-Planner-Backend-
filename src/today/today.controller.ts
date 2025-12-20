import { Controller, Get, UseGuards } from '@nestjs/common';
import { TodayService } from './today.service';
import { UserId } from '../common/user-id.decorator';
import { JwtAuthGuard } from '../auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('today')
export class TodayController {
  constructor(private readonly todayService: TodayService) {}

  @Get()
  async getToday(@UserId() userId: number) {
    return this.todayService.getToday(userId);
  }
}
