import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { PrismaService } from '../prisma';
import { CreateFeedbackDto } from './feedback.dto';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let prismaService: {
    feedback: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };

  const mockFeedback = {
    id: 1,
    userId: 1,
    feedbackType: 'bug',
    category: 'ui',
    subject: 'Button not working',
    message: 'The submit button does not respond to clicks',
    attachments: ['screenshot.png'],
    status: 'pending',
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      feedback: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create feedback with all fields and attachments', async () => {
      const createDto: CreateFeedbackDto = {
        feedbackType: 'bug',
        category: 'ui',
        subject: 'Button not working',
        message: 'The submit button does not respond to clicks',
      };
      const attachments = ['screenshot.png', 'error.log'];
      const userId = 1;

      prismaService.feedback.create.mockResolvedValue({
        ...mockFeedback,
        attachments,
      });

      const result = await service.create(userId, createDto, attachments);

      expect(prismaService.feedback.create).toHaveBeenCalledWith({
        data: {
          feedbackType: createDto.feedbackType,
          category: createDto.category,
          subject: createDto.subject,
          message: createDto.message,
          attachments,
          user: { connect: { id: userId } },
        },
      });
      expect(result).toEqual({
        ...mockFeedback,
        attachments,
      });
    });

    it('should create feedback without attachments', async () => {
      const createDto: CreateFeedbackDto = {
        feedbackType: 'feature',
        category: 'enhancement',
        subject: 'Add dark mode',
        message: 'Please add dark mode to the application',
      };
      const userId = 2;

      const expectedFeedback = {
        ...mockFeedback,
        id: 2,
        userId: 2,
        feedbackType: 'feature',
        category: 'enhancement',
        subject: 'Add dark mode',
        message: 'Please add dark mode to the application',
        attachments: [],
      };

      prismaService.feedback.create.mockResolvedValue(expectedFeedback);

      const result = await service.create(userId, createDto, []);

      expect(prismaService.feedback.create).toHaveBeenCalledWith({
        data: {
          feedbackType: createDto.feedbackType,
          category: createDto.category,
          subject: createDto.subject,
          message: createDto.message,
          attachments: [],
          user: { connect: { id: userId } },
        },
      });
      expect(result).toEqual(expectedFeedback);
    });

    it('should create feedback without category', async () => {
      const createDto: CreateFeedbackDto = {
        feedbackType: 'question',
        subject: 'How to use this feature?',
        message: 'I need help understanding how to use this feature',
      };
      const userId = 1;

      const expectedFeedback = {
        ...mockFeedback,
        feedbackType: 'question',
        category: undefined,
        subject: 'How to use this feature?',
        message: 'I need help understanding how to use this feature',
        attachments: [],
      };

      prismaService.feedback.create.mockResolvedValue(expectedFeedback);

      const result = await service.create(userId, createDto);

      expect(prismaService.feedback.create).toHaveBeenCalledWith({
        data: {
          feedbackType: createDto.feedbackType,
          category: createDto.category,
          subject: createDto.subject,
          message: createDto.message,
          attachments: [],
          user: { connect: { id: userId } },
        },
      });
      expect(result).toEqual(expectedFeedback);
    });

    it('should create feedback with default empty attachments array when not provided', async () => {
      const createDto: CreateFeedbackDto = {
        feedbackType: 'suggestion',
        category: 'performance',
        subject: 'App is slow',
        message: 'The application takes too long to load',
      };
      const userId = 3;

      const expectedFeedback = {
        ...mockFeedback,
        id: 3,
        userId: 3,
        feedbackType: 'suggestion',
        category: 'performance',
        subject: 'App is slow',
        message: 'The application takes too long to load',
        attachments: [],
      };

      prismaService.feedback.create.mockResolvedValue(expectedFeedback);

      const result = await service.create(userId, createDto);

      expect(prismaService.feedback.create).toHaveBeenCalledWith({
        data: {
          feedbackType: createDto.feedbackType,
          category: createDto.category,
          subject: createDto.subject,
          message: createDto.message,
          attachments: [],
          user: { connect: { id: userId } },
        },
      });
      expect(result).toEqual(expectedFeedback);
    });

    it('should create feedback with multiple attachments', async () => {
      const createDto: CreateFeedbackDto = {
        feedbackType: 'bug',
        category: 'crash',
        subject: 'Application crashes on startup',
        message: 'The app crashes immediately after opening',
      };
      const attachments = [
        'crash-log-1.txt',
        'crash-log-2.txt',
        'screenshot1.png',
        'screenshot2.png',
        'video.mp4',
      ];
      const userId = 1;

      const expectedFeedback = {
        ...mockFeedback,
        feedbackType: 'bug',
        category: 'crash',
        subject: 'Application crashes on startup',
        message: 'The app crashes immediately after opening',
        attachments,
      };

      prismaService.feedback.create.mockResolvedValue(expectedFeedback);

      const result = await service.create(userId, createDto, attachments);

      expect(prismaService.feedback.create).toHaveBeenCalledWith({
        data: {
          feedbackType: createDto.feedbackType,
          category: createDto.category,
          subject: createDto.subject,
          message: createDto.message,
          attachments,
          user: { connect: { id: userId } },
        },
      });
      expect(result).toEqual(expectedFeedback);
      expect(result.attachments).toHaveLength(5);
    });
  });

  describe('findAll', () => {
    it('should return all feedback for a user ordered by createdAt desc', async () => {
      const userId = 1;
      const mockFeedbackList = [
        {
          ...mockFeedback,
          id: 3,
          createdAt: new Date('2024-01-03T10:00:00Z'),
        },
        {
          ...mockFeedback,
          id: 2,
          createdAt: new Date('2024-01-02T10:00:00Z'),
        },
        {
          ...mockFeedback,
          id: 1,
          createdAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      prismaService.feedback.findMany.mockResolvedValue(mockFeedbackList);

      const result = await service.findAll(userId);

      expect(prismaService.feedback.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockFeedbackList);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when user has no feedback', async () => {
      const userId = 2;

      prismaService.feedback.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(prismaService.feedback.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return only feedback for the specified user', async () => {
      const userId = 1;
      const mockFeedbackList = [
        { ...mockFeedback, id: 1, userId: 1 },
        { ...mockFeedback, id: 2, userId: 1 },
      ];

      prismaService.feedback.findMany.mockResolvedValue(mockFeedbackList);

      const result = await service.findAll(userId);

      expect(prismaService.feedback.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockFeedbackList);
      expect(result.every((f) => f.userId === userId)).toBe(true);
    });

    it('should return feedback with different types and categories', async () => {
      const userId = 1;
      const mockFeedbackList = [
        {
          ...mockFeedback,
          id: 1,
          feedbackType: 'bug',
          category: 'ui',
        },
        {
          ...mockFeedback,
          id: 2,
          feedbackType: 'feature',
          category: 'enhancement',
        },
        {
          ...mockFeedback,
          id: 3,
          feedbackType: 'question',
          category: null,
        },
      ];

      prismaService.feedback.findMany.mockResolvedValue(mockFeedbackList);

      const result = await service.findAll(userId);

      expect(prismaService.feedback.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockFeedbackList);
      expect(result).toHaveLength(3);
    });
  });
});
