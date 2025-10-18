import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { PrismaService } from 'src/prisma';
import Redis from 'ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS } from './session.constants';

@Module({
  imports: [ConfigModule],
  controllers: [SessionController],
  providers: [
    SessionService,
    PrismaService,
    {
      provide: REDIS,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (redisUrl) {
          return new Redis(redisUrl, {
            lazyConnect: true,
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
          });
        }
        return new Redis({
          host: configService.get('REDIS_HOST') || '127.0.0.1',
          port: Number(configService.get('REDIS_PORT') || 6379),
          password: configService.get('REDIS_PASSWORD') || undefined,
          lazyConnect: true,
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS, SessionService],
})
export class SessionModule {}
