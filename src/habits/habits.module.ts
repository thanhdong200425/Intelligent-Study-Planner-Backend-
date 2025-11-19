import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HabitsController],
  providers: [HabitsService],
})
export class HabitsModule {}
