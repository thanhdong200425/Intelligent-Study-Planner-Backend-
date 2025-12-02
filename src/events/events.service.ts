import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateEventDto } from './events.dto';
import { Prisma } from '@prisma/client';
import { validateDate, validateTimeOrder } from '../utilities/dateUtilities';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, data: CreateEventDto) {
    const { date, startTime, endTime, eventTypeId, taskId, title, note } = data;

    const dateOnly = validateDate(date);
    const { start, end } = validateTimeOrder(dateOnly, startTime, endTime);

    const dataToCreate: Prisma.EventCreateInput = {
      title,
      note,
      date: dateOnly,
      startTime: start,
      endTime: end,
      user: { connect: { id: userId } },
      eventType: { connect: { id: eventTypeId } },
      ...(taskId ? { task: { connect: { id: taskId } } } : {}),
    };

    return this.prisma.event.create({ data: dataToCreate });
  }

  list(userId: number) {
    return this.prisma.event.findMany({
      where: { userId },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      include: {
        eventType: true,
        task: {
          select: {
            title: true,
          },
        },
      },
    });
  }

  async remove(userId: number, id: number) {
    const existing = await this.prisma.event.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Event not found');
    }

    await this.prisma.event.delete({ where: { id } });
    return { success: true };
  }
}
