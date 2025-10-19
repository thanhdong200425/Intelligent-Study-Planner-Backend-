import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS } from 'src/session/session.constants';

const redisProvider = {
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
      port: Number(configService.get('REDIS_PORT')) || 6379,
      password: configService.get('REDIS_PASSWORD') || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });
  },
  inject: [ConfigService],
};

@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class RedisModule {}
