import { Test, TestingModule } from '@nestjs/testing';
import { TimerSessionController } from './timer-session.controller';
import { TimerSessionService } from './timer-session.service';
import { TimerSessionType } from '@prisma/client';
import {
  CreateTimerSessionDto,
  UpdateTimerSessionDto,
} from './timer-session.dto';

describe('TimerSessionController', () => {
  let controller: TimerSessionController;
  let service: {
    create: jest.Mock;
    update: jest.Mock;
    getTodaySessions: jest.Mock;
  };

  const mockTimerSession = {
    id: 1,
    userId: 1,
    type: TimerSessionType.focus,
    timeBlockId: null,
    taskId: null,
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: null,
    durationMinutes: 0,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  };

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      update: jest.fn(),
      getTodaySessions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimerSessionController],
      providers: [
        {
          provide: TimerSessionService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TimerSessionController>(TimerSessionController);
    service = module.get(TimerSessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a timer session with all fields', async () => {
      const userId = 1;
      const createDto: CreateTimerSessionDto = {
        type: TimerSessionType.focus,
        taskId: 10,
        timeBlockId: 20,
        startTime: '2024-01-01T10:00:00Z',
      };

      const expectedResult = {
        ...mockTimerSession,
        taskId: 10,
        timeBlockId: 20,
      };

      service.create.mockResolvedValue(expectedResult);

      const result = await controller.create(userId, createDto);

      expect(service.create).toHaveBeenCalledWith({
        userId,
        taskId: 10,
        timeBlockId: 20,
        data: {
          type: TimerSessionType.focus,
          startTime: new Date('2024-01-01T10:00:00Z'),
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a timer session without taskId and timeBlockId', async () => {
      const userId = 1;
      const createDto: CreateTimerSessionDto = {
        type: TimerSessionType.break,
        taskId: null,
        timeBlockId: null,
        startTime: '2024-01-01T11:00:00Z',
      };

      const expectedResult = {
        ...mockTimerSession,
        type: TimerSessionType.break,
        startTime: new Date('2024-01-01T11:00:00Z'),
      };

      service.create.mockResolvedValue(expectedResult);

      const result = await controller.create(userId, createDto);

      expect(service.create).toHaveBeenCalledWith({
        userId,
        taskId: null,
        timeBlockId: null,
        data: {
          type: TimerSessionType.break,
          startTime: new Date('2024-01-01T11:00:00Z'),
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a timer session with only taskId', async () => {
      const userId = 1;
      const createDto: CreateTimerSessionDto = {
        type: TimerSessionType.focus,
        taskId: 10,
        timeBlockId: null,
        startTime: '2024-01-01T10:00:00Z',
      };

      const expectedResult = {
        ...mockTimerSession,
        taskId: 10,
      };

      service.create.mockResolvedValue(expectedResult);

      const result = await controller.create(userId, createDto);

      expect(service.create).toHaveBeenCalledWith({
        userId,
        taskId: 10,
        timeBlockId: null,
        data: {
          type: TimerSessionType.focus,
          startTime: new Date('2024-01-01T10:00:00Z'),
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a timer session with only timeBlockId', async () => {
      const userId = 1;
      const createDto: CreateTimerSessionDto = {
        type: TimerSessionType.long_break,
        taskId: null,
        timeBlockId: 20,
        startTime: '2024-01-01T12:00:00Z',
      };

      const expectedResult = {
        ...mockTimerSession,
        type: TimerSessionType.long_break,
        timeBlockId: 20,
        startTime: new Date('2024-01-01T12:00:00Z'),
      };

      service.create.mockResolvedValue(expectedResult);

      const result = await controller.create(userId, createDto);

      expect(service.create).toHaveBeenCalledWith({
        userId,
        taskId: null,
        timeBlockId: 20,
        data: {
          type: TimerSessionType.long_break,
          startTime: new Date('2024-01-01T12:00:00Z'),
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should convert startTime string to Date object', async () => {
      const userId = 1;
      const createDto: CreateTimerSessionDto = {
        type: TimerSessionType.focus,
        taskId: null,
        timeBlockId: null,
        startTime: '2024-01-01T15:30:00Z',
      };

      const expectedResult = {
        ...mockTimerSession,
        startTime: new Date('2024-01-01T15:30:00Z'),
      };

      service.create.mockResolvedValue(expectedResult);

      await controller.create(userId, createDto);

      expect(service.create).toHaveBeenCalledWith({
        userId,
        taskId: null,
        timeBlockId: null,
        data: {
          type: TimerSessionType.focus,
          startTime: new Date('2024-01-01T15:30:00Z'),
        },
      });
    });
  });

  describe('update', () => {
    it('should update a timer session with all fields', async () => {
      const id = 1;
      const updateDto: UpdateTimerSessionDto = {
        type: TimerSessionType.break,
        startTime: '2024-01-01T10:30:00Z',
        endTime: '2024-01-01T11:00:00Z',
        durationMinutes: 30,
      };

      const expectedResult = {
        ...mockTimerSession,
        type: TimerSessionType.break,
        startTime: new Date('2024-01-01T10:30:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        durationMinutes: 30,
      };

      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should update a timer session with partial data', async () => {
      const id = 1;
      const updateDto: UpdateTimerSessionDto = {
        endTime: '2024-01-01T11:00:00Z',
        durationMinutes: 25,
      };

      const expectedResult = {
        ...mockTimerSession,
        endTime: new Date('2024-01-01T11:00:00Z'),
        durationMinutes: 25,
      };

      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should update a timer session with only endTime', async () => {
      const id = 1;
      const updateDto: UpdateTimerSessionDto = {
        endTime: '2024-01-01T11:00:00Z',
      };

      const expectedResult = {
        ...mockTimerSession,
        endTime: new Date('2024-01-01T11:00:00Z'),
      };

      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should update a timer session with only durationMinutes', async () => {
      const id = 1;
      const updateDto: UpdateTimerSessionDto = {
        durationMinutes: 45,
      };

      const expectedResult = {
        ...mockTimerSession,
        durationMinutes: 45,
      };

      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should update a timer session with type change', async () => {
      const id = 1;
      const updateDto: UpdateTimerSessionDto = {
        type: TimerSessionType.long_break,
      };

      const expectedResult = {
        ...mockTimerSession,
        type: TimerSessionType.long_break,
      };

      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should parse id parameter correctly', async () => {
      const id = 42;
      const updateDto: UpdateTimerSessionDto = {
        durationMinutes: 60,
      };

      const expectedResult = {
        ...mockTimerSession,
        id: 42,
        durationMinutes: 60,
      };

      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(42, updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getTodaySessions', () => {
    it('should get today sessions for a user', async () => {
      const userId = 1;
      const expectedResult = [
        {
          ...mockTimerSession,
          id: 1,
          startTime: new Date('2024-01-01T10:00:00Z'),
        },
        {
          ...mockTimerSession,
          id: 2,
          startTime: new Date('2024-01-01T14:00:00Z'),
        },
      ];

      service.getTodaySessions.mockResolvedValue(expectedResult);

      const result = await controller.getTodaySessions(userId);

      expect(service.getTodaySessions).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });

    it('should return empty array when user has no sessions today', async () => {
      const userId = 1;
      const expectedResult: never[] = [];

      service.getTodaySessions.mockResolvedValue(expectedResult);

      const result = await controller.getTodaySessions(userId);

      expect(service.getTodaySessions).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });

    it('should get today sessions for different users', async () => {
      const userId = 2;
      const expectedResult = [
        {
          ...mockTimerSession,
          id: 3,
          userId: 2,
        },
      ];

      service.getTodaySessions.mockResolvedValue(expectedResult);

      const result = await controller.getTodaySessions(userId);

      expect(service.getTodaySessions).toHaveBeenCalledWith(2);
      expect(result).toEqual(expectedResult);
    });
  });
});
