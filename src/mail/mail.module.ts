import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [ConfigModule, RedisModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
