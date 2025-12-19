import { Module } from '@nestjs/common';
import { TodayController } from './today.controller';
import { TodayService } from './today.service';
import { PrismaModule } from '../prisma';
import { TasksModule } from '../tasks/tasks.module';
import { DeadlinesModule } from '../deadlines/deadlines.module';
import { AvailabilityModule } from '../availability/availability.module';
import { UsersModule } from '../user/users.module';

@Module({
  imports: [
    PrismaModule,
    TasksModule,
    DeadlinesModule,
    AvailabilityModule,
    UsersModule,
  ],
  controllers: [TodayController],
  providers: [TodayService],
})
export class TodayModule {}
