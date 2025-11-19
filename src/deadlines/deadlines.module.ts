import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { DeadlinesService } from './deadlines.service';
import { DeadlinesController } from './deadlines.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DeadlinesController],
  providers: [DeadlinesService],
})
export class DeadlinesModule {}
