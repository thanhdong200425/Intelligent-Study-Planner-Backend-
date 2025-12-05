import { Test, TestingModule } from '@nestjs/testing';
import { TimerSessionService } from './timer-session.service';
import { PrismaService } from 'src/prisma';
import { TimerSessionType } from '@prisma/client';
import { UpdateTimerSessionDto } from './timer-session.dto';

describe('TimerSessionService', () => {
  let service: TimerSessionService;
  let prismaService: {
    timerSession: {
      create: jest.Mock;
      update: jest.Mock;
    };
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
    const mockPrismaService = {
      timerSession: {
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimerSessionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TimerSessionService>(TimerSessionService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a timer session with taskId and timeBlockId', async () => {
      const createData = {
        userId: 1,
        taskId: 10,
        timeBlockId: 20,
        data: {
          type: TimerSessionType.focus,
          startTime: new Date('2024-01-01T10:00:00Z'),
        },
      };

      const expectedResult = {
        ...mockTimerSession,
        taskId: 10,
        timeBlockId: 20,
      };

      prismaService.timerSession.create.mockResolvedValue(expectedResult);

      const result = await service.create(createData);

      expect(prismaService.timerSession.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 1 } },
          task: { connect: { id: 10 } },
          timeBlock: { connect: { id: 20 } },
          type: TimerSessionType.focus,
          startTime: new Date('2024-01-01T10:00:00Z'),
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a timer session without taskId and timeBlockId', async () => {
      const createData = {
        userId: 1,
        taskId: null,
        timeBlockId: null,
        data: {
          type: TimerSessionType.break,
          startTime: new Date('2024-01-01T11:00:00Z'),
        },
      };

      const expectedResult = {
        ...mockTimerSession,
        type: TimerSessionType.break,
        startTime: new Date('2024-01-01T11:00:00Z'),
      };

      prismaService.timerSession.create.mockResolvedValue(expectedResult);

      const result = await service.create(createData);

      expect(prismaService.timerSession.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 1 } },
          type: TimerSessionType.break,
          startTime: new Date('2024-01-01T11:00:00Z'),
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a timer session with only taskId', async () => {
      const createData = {
        userId: 1,
        taskId: 10,
        timeBlockId: null,
        data: {
          type: TimerSessionType.focus,
          startTime: new Date('2024-01-01T10:00:00Z'),
        },
      };

      const expectedResult = {
        ...mockTimerSession,
        taskId: 10,
      };

      prismaService.timerSession.create.mockResolvedValue(expectedResult);

      const result = await service.create(createData);

      expect(prismaService.timerSession.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 1 } },
          task: { connect: { id: 10 } },
          type: TimerSessionType.focus,
          startTime: new Date('2024-01-01T10:00:00Z'),
        },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should create a timer session with only timeBlockId', async () => {
      const createData = {
        userId: 1,
        taskId: null,
        timeBlockId: 20,
        data: {
          type: TimerSessionType.long_break,
          startTime: new Date('2024-01-01T12:00:00Z'),
        },
      };

      const expectedResult = {
        ...mockTimerSession,
        type: TimerSessionType.long_break,
        timeBlockId: 20,
        startTime: new Date('2024-01-01T12:00:00Z'),
      };

      prismaService.timerSession.create.mockResolvedValue(expectedResult);

      const result = await service.create(createData);

      expect(prismaService.timerSession.create).toHaveBeenCalledWith({
        data: {
          user: { connect: { id: 1 } },
          timeBlock: { connect: { id: 20 } },
          type: TimerSessionType.long_break,
          startTime: new Date('2024-01-01T12:00:00Z'),
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a timer session with all fields', async () => {
      const updateData: UpdateTimerSessionDto = {
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

      prismaService.timerSession.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateData);

      expect(prismaService.timerSession.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update a timer session with partial data', async () => {
      const updateData: UpdateTimerSessionDto = {
        endTime: '2024-01-01T11:00:00Z',
        durationMinutes: 25,
      };

      const expectedResult = {
        ...mockTimerSession,
        endTime: new Date('2024-01-01T11:00:00Z'),
        durationMinutes: 25,
      };

      prismaService.timerSession.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateData);

      expect(prismaService.timerSession.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update a timer session with only endTime', async () => {
      const updateData: UpdateTimerSessionDto = {
        endTime: '2024-01-01T11:00:00Z',
      };

      const expectedResult = {
        ...mockTimerSession,
        endTime: new Date('2024-01-01T11:00:00Z'),
      };

      prismaService.timerSession.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateData);

      expect(prismaService.timerSession.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update a timer session with only durationMinutes', async () => {
      const updateData: UpdateTimerSessionDto = {
        durationMinutes: 45,
      };

      const expectedResult = {
        ...mockTimerSession,
        durationMinutes: 45,
      };

      prismaService.timerSession.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateData);

      expect(prismaService.timerSession.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should update a timer session with type change', async () => {
      const updateData: UpdateTimerSessionDto = {
        type: TimerSessionType.long_break,
      };

      const expectedResult = {
        ...mockTimerSession,
        type: TimerSessionType.long_break,
      };

      prismaService.timerSession.update.mockResolvedValue(expectedResult);

      const result = await service.update(1, updateData);

      expect(prismaService.timerSession.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
