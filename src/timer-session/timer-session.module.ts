import { Module } from '@nestjs/common';
import { TimerSessionService } from './timer-session.service';
import { TimerSessionController } from './timer-session.controller';

@Module({
  controllers: [TimerSessionController],
  providers: [TimerSessionService],
})
export class TimerSessionModule {}
