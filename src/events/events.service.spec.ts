import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateEventDto } from './events.dto';
import { validateDate, validateTimeOrder } from '../utilities/dateUtilities';

describe('EventsService', () => {
  let service: EventsService;
  let prismaService: {
    event: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockEvent = {
    id: 1,
    userId: 1,
    title: 'Test Event',
    date: new Date('2024-01-15'),
    startTime: new Date('2024-01-15T10:00:00Z'),
    endTime: new Date('2024-01-15T11:00:00Z'),
    note: 'Test note',
    eventTypeId: null,
    taskId: null,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  };

  // Helper function to create expected date/time values the same way the service does
  const createExpectedDateTime = (
    dateString: string,
    timeString?: string,
  ): Date => {
    const date = validateDate(dateString);
    if (timeString) {
      const [hour, minute] = timeString.split(':').map(Number);
      date.setHours(hour, minute, 0, 0);
    }
    return date;
  };

  beforeEach(async () => {
    const mockPrismaService = {
      event: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('should update an event with all fields', async () => {
      const updateData: UpdateEventDto = {
        title: 'Updated Event',
        date: '2024-01-20',
        startTime: '14:00',
        endTime: '15:30',
        note: 'Updated note',
        eventTypeId: 2,
        taskId: 5,
      };

      const expectedDate = createExpectedDateTime('2024-01-20');
      const { start: expectedStartTime, end: expectedEndTime } =
        validateTimeOrder(expectedDate, '14:00', '15:30');

      const expectedResult = {
        ...mockEvent,
        title: 'Updated Event',
        date: expectedDate,
        startTime: expectedStartTime,
        endTime: expectedEndTime,
        note: 'Updated note',
        eventTypeId: 2,
        taskId: 5,
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);
      prismaService.event.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, 1, updateData);

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          date: expectedDate,
          startTime: expectedStartTime,
          endTime: expectedEndTime,
          title: 'Updated Event',
          note: 'Updated note',
          eventTypeId: 2,
          taskId: 5,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update an event with only title', async () => {
      const updateData: UpdateEventDto = {
        title: 'New Title',
      };

      const expectedResult = {
        ...mockEvent,
        title: 'New Title',
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);
      prismaService.event.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, 1, updateData);

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          title: 'New Title',
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update an event with only date', async () => {
      const updateData: UpdateEventDto = {
        date: '2024-02-01',
      };

      const expectedDate = createExpectedDateTime('2024-02-01');
      const expectedResult = {
        ...mockEvent,
        date: expectedDate,
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);
      prismaService.event.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, 1, updateData);

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          date: expectedDate,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update an event with only startTime and endTime', async () => {
      const updateData: UpdateEventDto = {
        startTime: '09:00',
        endTime: '10:30',
      };

      const { start: expectedStartTime, end: expectedEndTime } =
        validateTimeOrder(mockEvent.date, '09:00', '10:30');

      const expectedResult = {
        ...mockEvent,
        startTime: expectedStartTime,
        endTime: expectedEndTime,
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);
      prismaService.event.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, 1, updateData);

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          startTime: expectedStartTime,
          endTime: expectedEndTime,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update an event with date and times together', async () => {
      const updateData: UpdateEventDto = {
        date: '2024-03-10',
        startTime: '16:00',
        endTime: '17:00',
      };

      const expectedDate = createExpectedDateTime('2024-03-10');
      const { start: expectedStartTime, end: expectedEndTime } =
        validateTimeOrder(expectedDate, '16:00', '17:00');

      const expectedResult = {
        ...mockEvent,
        date: expectedDate,
        startTime: expectedStartTime,
        endTime: expectedEndTime,
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);
      prismaService.event.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, 1, updateData);

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          date: expectedDate,
          startTime: expectedStartTime,
          endTime: expectedEndTime,
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update an event with only note', async () => {
      const updateData: UpdateEventDto = {
        note: 'Updated note only',
      };

      const expectedResult = {
        ...mockEvent,
        note: 'Updated note only',
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);
      prismaService.event.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, 1, updateData);

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          note: 'Updated note only',
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should not update times when only startTime is provided', async () => {
      const updateData: UpdateEventDto = {
        startTime: '12:00',
      };

      const expectedResult = {
        ...mockEvent,
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);
      prismaService.event.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, 1, updateData);

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {},
      });
      expect(result).toEqual(expectedResult);
    });

    it('should not update times when only endTime is provided', async () => {
      const updateData: UpdateEventDto = {
        endTime: '18:00',
      };

      const expectedResult = {
        ...mockEvent,
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);
      prismaService.event.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, 1, updateData);

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {},
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      const updateData: UpdateEventDto = {
        title: 'Updated Title',
      };

      prismaService.event.findFirst.mockResolvedValue(null);

      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        'Event not found',
      );

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when event belongs to different user', async () => {
      const updateData: UpdateEventDto = {
        title: 'Updated Title',
      };

      prismaService.event.findFirst.mockResolvedValue(null);

      await expect(service.update(2, 1, updateData)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(2, 1, updateData)).rejects.toThrow(
        'Event not found',
      );

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 2 },
      });
      expect(prismaService.event.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when date is invalid', async () => {
      const updateData: UpdateEventDto = {
        date: 'invalid-date',
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);

      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        'Invalid event date',
      );

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when startTime is invalid', async () => {
      const updateData: UpdateEventDto = {
        startTime: 'invalid-time',
        endTime: '15:00',
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);

      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        'Invalid event time',
      );

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when endTime is invalid', async () => {
      const updateData: UpdateEventDto = {
        startTime: '10:00',
        endTime: 'invalid-time',
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);

      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        'Invalid event time',
      );

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when startTime is not earlier than endTime', async () => {
      const updateData: UpdateEventDto = {
        startTime: '15:00',
        endTime: '14:00',
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);

      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        'Start time must be earlier than end time for an event',
      );

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when startTime equals endTime', async () => {
      const updateData: UpdateEventDto = {
        startTime: '15:00',
        endTime: '15:00',
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);

      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, 1, updateData)).rejects.toThrow(
        'Start time must be earlier than end time for an event',
      );

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).not.toHaveBeenCalled();
    });

    it('should update eventTypeId and taskId', async () => {
      const updateData: UpdateEventDto = {
        eventTypeId: 3,
        taskId: 7,
      };

      const expectedResult = {
        ...mockEvent,
        eventTypeId: 3,
        taskId: 7,
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);
      prismaService.event.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, 1, updateData);

      expect(prismaService.event.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          eventTypeId: 3,
          taskId: 7,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
