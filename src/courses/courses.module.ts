import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
