import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS } from 'src/session/session.constants';
import Redis from 'ioredis';

@Module({
  imports: [ConfigModule],
  providers: [MailService,  {
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
  },],
  exports: [MailService],
})
export class MailModule {}
