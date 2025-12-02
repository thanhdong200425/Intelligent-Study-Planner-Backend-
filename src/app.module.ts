import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { CoursesModule } from './courses/courses.module';
import { DeadlinesModule } from './deadlines/deadlines.module';
import { TasksModule } from './tasks/tasks.module';
import { AvailabilityModule } from './availability/availability.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './user/users.module';
import { TimerSessionModule } from './timer-session/timer-session.module';
import { EventTypesModule } from './event-types/event-types.module';

import { SpotifyModule } from './spotify/spotify.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SessionModule,
    TimerSessionModule,
    TasksModule,
    DeadlinesModule,
    CoursesModule,
    AvailabilityModule,
    EventTypesModule,
    MailModule,
    RedisModule,
    SpotifyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(consumer: MiddlewareConsumer) {}
}
