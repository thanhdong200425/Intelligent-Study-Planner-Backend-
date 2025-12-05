import { BadRequestException } from '@nestjs/common';

export const validateDate = (dateString: string): Date => {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Invalid event date');
  }

  return date;
};

export const validateTimeOrder = (
  date: Date,
  startTime: string,
  endTime: string,
): { start: Date; end: Date } => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute)
  ) {
    throw new BadRequestException('Invalid event time');
  }

  const start = new Date(date);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMinute, 0, 0);

  if (start >= end) {
    throw new BadRequestException(
      'Start time must be earlier than end time for an event',
    );
  }

  return { start, end };
};
