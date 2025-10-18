import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, data: Prisma.CourseCreateInput) {
    return this.prisma.course.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  findAll(userId: number) {
    return this.prisma.course.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(userId: number, id: number, data: Prisma.CourseUpdateInput) {
    const existing = await this.prisma.course.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Course not found');
    return this.prisma.course.update({ where: { id }, data });
  }

  async remove(userId: number, id: number) {
    const existing = await this.prisma.course.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Course not found');
    await this.prisma.course.delete({ where: { id } });
    return { success: true };
  }
}