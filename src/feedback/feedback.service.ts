import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateFeedbackDto } from './feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    data: CreateFeedbackDto,
    attachments: string[] = [],
  ) {
    return this.prisma.feedback.create({
      data: {
        feedbackType: data.feedbackType,
        category: data.category,
        subject: data.subject,
        message: data.message,
        attachments,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
