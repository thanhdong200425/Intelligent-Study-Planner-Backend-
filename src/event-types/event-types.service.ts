import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateEventTypeDto, UpdateEventTypeDto } from './event-types.dto';
import { EventType } from '@prisma/client';

@Injectable()
export class EventTypesService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, data: CreateEventTypeDto) {
    return this.prisma.eventType.create({
      data: {
        name: data.name,
        color: data.color,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(userId: number): Promise<EventType[]> {
    return await this.prisma.eventType.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: number, id: number) {
    const eventType = await this.prisma.eventType.findFirst({
      where: { id, userId },
    });

    if (!eventType) {
      throw new NotFoundException('Event type not found');
    }

    return eventType;
  }

  async update(userId: number, id: number, data: UpdateEventTypeDto) {
    // Verify ownership
    await this.findOne(userId, id);

    return this.prisma.eventType.update({
      where: { id },
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  async remove(userId: number, id: number) {
    // Verify ownership
    await this.findOne(userId, id);

    await this.prisma.eventType.delete({
      where: { id },
    });

    return { success: true };
  }
}
