import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { CoursesModule } from './courses/courses.module';
import { DeadlinesModule } from './deadlines/deadlines.module';
import { TasksModule } from './tasks/tasks.module';
import { AvailabilityModule } from './availability/availability.module';
import { HabitsModule } from './habits/habits.module';

@Module({
  imports: [PrismaModule, CoursesModule, DeadlinesModule, TasksModule, AvailabilityModule, HabitsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
