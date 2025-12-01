import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CreateTimerSessionDto } from './timer-session.dto';
import { TimerSessionService } from './timer-session.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UserId } from 'src/common/user-id.decorator';

@UseGuards(JwtAuthGuard)
@Controller('timer-session')
export class TimerSessionController {
  constructor(private readonly timerSessionService: TimerSessionService) {}

  @Post()
  async create(@UserId() userId: number, @Body() body: CreateTimerSessionDto) {
    return await this.timerSessionService.create({
      userId,
      taskId: body.taskId,
      timeBlockId: body.timeBlockId,
      data: { type: body.type, startTime: new Date(body.startTime) },
    });
  }

  @Get('today')
  async getTodaySessions(@UserId() userId: number) {
    return await this.timerSessionService.getTodaySessions(userId);
  }
}
