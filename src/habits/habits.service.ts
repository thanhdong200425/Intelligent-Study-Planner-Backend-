import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  createHabit(userId: number, data: Prisma.HabitCreateInput) {
    return this.prisma.habit.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  listHabits(userId: number) {
    return this.prisma.habit.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async checkIn(userId: number, habitId: number, date: Date, minutes: number) {
    // Upsert completion for the day
    const completion = await this.prisma.habitCompletion.upsert({
      where: { habitId_date: { habitId, date } },
      create: { habit: { connect: { id: habitId } }, user: { connect: { id: userId } }, date, minutes },
      update: { minutes },
    });
    return completion;
  }

  async removeHabit(userId: number, id: number) {
    const existing = await this.prisma.habit.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Habit not found');
    await this.prisma.habit.delete({ where: { id } });
    return { success: true };
  }
}