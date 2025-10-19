import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { PrismaService } from 'src/prisma';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [ConfigModule, RedisModule],
  controllers: [SessionController],
  providers: [SessionService, PrismaService],
  exports: [SessionService],
})
export class SessionModule {}
