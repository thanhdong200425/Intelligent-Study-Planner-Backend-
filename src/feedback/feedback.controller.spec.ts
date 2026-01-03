import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './feedback.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
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
    const mockFeedbackService = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<FeedbackController>(FeedbackController);
    service = module.get(FeedbackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create feedback with files', async () => {
      const userId = 1;
      const createDto: CreateFeedbackDto = {
        feedbackType: 'bug',
        category: 'ui',
        subject: 'Button not working',
        message: 'The submit button does not respond to clicks',
      };
      const mockFiles = [
        {
          fieldname: 'attachments',
          originalname: 'screenshot.png',
          encoding: '7bit',
          mimetype: 'image/png',
          buffer: Buffer.from('fake-image-data'),
          size: 1024,
        },
        {
          fieldname: 'attachments',
          originalname: 'error.log',
          encoding: '7bit',
          mimetype: 'text/plain',
          buffer: Buffer.from('fake-log-data'),
          size: 512,
        },
      ] as Express.Multer.File[];

      const expectedAttachments = ['screenshot.png', 'error.log'];

      service.create.mockResolvedValue({
        ...mockFeedback,
        attachments: expectedAttachments,
      });

      const result = await controller.create(userId, createDto, mockFiles);

      expect(service.create).toHaveBeenCalledWith(
        userId,
        createDto,
        expectedAttachments,
      );
      expect(result).toEqual({
        ...mockFeedback,
        attachments: expectedAttachments,
      });
    });

    it('should create feedback without files', async () => {
      const userId = 1;
      const createDto: CreateFeedbackDto = {
        feedbackType: 'feature',
        category: 'enhancement',
        subject: 'Add dark mode',
        message: 'Please add dark mode to the application',
      };
      const mockFiles = [] as Express.Multer.File[];

      const expectedFeedback = {
        ...mockFeedback,
        feedbackType: 'feature',
        category: 'enhancement',
        subject: 'Add dark mode',
        message: 'Please add dark mode to the application',
        attachments: [],
      };

      service.create.mockResolvedValue(expectedFeedback);

      const result = await controller.create(userId, createDto, mockFiles);

      expect(service.create).toHaveBeenCalledWith(userId, createDto, []);
      expect(result).toEqual(expectedFeedback);
    });

    it('should create feedback when files parameter is undefined', async () => {
      const userId = 2;
      const createDto: CreateFeedbackDto = {
        feedbackType: 'question',
        subject: 'How to use this feature?',
        message: 'I need help understanding how to use this feature',
      };

      const expectedFeedback = {
        ...mockFeedback,
        id: 2,
        userId: 2,
        feedbackType: 'question',
        category: undefined,
        subject: 'How to use this feature?',
        message: 'I need help understanding how to use this feature',
        attachments: [],
      };

      service.create.mockResolvedValue(expectedFeedback);

      const result = await controller.create(userId, createDto, undefined);

      expect(service.create).toHaveBeenCalledWith(userId, createDto, []);
      expect(result).toEqual(expectedFeedback);
    });

    it('should create feedback with single file', async () => {
      const userId = 1;
      const createDto: CreateFeedbackDto = {
        feedbackType: 'bug',
        category: 'crash',
        subject: 'Application crashes',
        message: 'The app crashes on startup',
      };
      const mockFiles = [
        {
          fieldname: 'attachments',
          originalname: 'crash-log.txt',
          encoding: '7bit',
          mimetype: 'text/plain',
          buffer: Buffer.from('crash-data'),
          size: 256,
        },
      ] as Express.Multer.File[];

      const expectedAttachments = ['crash-log.txt'];

      service.create.mockResolvedValue({
        ...mockFeedback,
        attachments: expectedAttachments,
      });

      const result = await controller.create(userId, createDto, mockFiles);

      expect(service.create).toHaveBeenCalledWith(
        userId,
        createDto,
        expectedAttachments,
      );
      expect(result.attachments).toEqual(expectedAttachments);
    });

    it('should create feedback with maximum allowed files (10)', async () => {
      const userId = 1;
      const createDto: CreateFeedbackDto = {
        feedbackType: 'bug',
        category: 'ui',
        subject: 'Multiple issues',
        message: 'Several UI problems found',
      };

      const mockFiles = Array.from({ length: 10 }, (_, i) => ({
        fieldname: 'attachments',
        originalname: `file${i + 1}.png`,
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from(`data${i + 1}`),
        size: 100,
      })) as Express.Multer.File[];

      const expectedAttachments = mockFiles.map((f) => f.originalname);

      service.create.mockResolvedValue({
        ...mockFeedback,
        attachments: expectedAttachments,
      });

      const result = await controller.create(userId, createDto, mockFiles);

      expect(service.create).toHaveBeenCalledWith(
        userId,
        createDto,
        expectedAttachments,
      );
      expect(result.attachments).toHaveLength(10);
    });

    it('should extract originalname from files correctly', async () => {
      const userId = 1;
      const createDto: CreateFeedbackDto = {
        feedbackType: 'suggestion',
        category: 'ux',
        subject: 'Improve navigation',
        message: 'Navigation could be more intuitive',
      };
      const mockFiles = [
        {
          fieldname: 'attachments',
          originalname: 'design-mockup.pdf',
          encoding: '7bit',
          mimetype: 'application/pdf',
          buffer: Buffer.from('pdf-data'),
          size: 2048,
        },
      ] as Express.Multer.File[];

      service.create.mockResolvedValue({
        ...mockFeedback,
        attachments: ['design-mockup.pdf'],
      });

      const result = await controller.create(userId, createDto, mockFiles);

      expect(service.create).toHaveBeenCalledWith(userId, createDto, [
        'design-mockup.pdf',
      ]);
      expect(result.attachments[0]).toBe('design-mockup.pdf');
    });

    it('should handle files with special characters in names', async () => {
      const userId = 1;
      const createDto: CreateFeedbackDto = {
        feedbackType: 'bug',
        category: 'data',
        subject: 'Data export issue',
        message: 'Cannot export data correctly',
      };
      const mockFiles = [
        {
          fieldname: 'attachments',
          originalname: 'file with spaces & special-chars_123.txt',
          encoding: '7bit',
          mimetype: 'text/plain',
          buffer: Buffer.from('data'),
          size: 100,
        },
      ] as Express.Multer.File[];

      service.create.mockResolvedValue({
        ...mockFeedback,
        attachments: ['file with spaces & special-chars_123.txt'],
      });

      const result = await controller.create(userId, createDto, mockFiles);

      expect(service.create).toHaveBeenCalledWith(userId, createDto, [
        'file with spaces & special-chars_123.txt',
      ]);
      expect(result.attachments[0]).toBe(
        'file with spaces & special-chars_123.txt',
      );
    });
  });

  describe('findAll', () => {
    it('should return all feedback for a user', async () => {
      const userId = 1;
      const mockFeedbackList = [
        {
          ...mockFeedback,
          id: 1,
        },
        {
          ...mockFeedback,
          id: 2,
          feedbackType: 'feature',
          subject: 'New feature request',
        },
        {
          ...mockFeedback,
          id: 3,
          feedbackType: 'question',
          subject: 'Help needed',
        },
      ];

      service.findAll.mockResolvedValue(mockFeedbackList);

      const result = await controller.findAll(userId);

      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockFeedbackList);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when user has no feedback', async () => {
      const userId = 2;

      service.findAll.mockResolvedValue([]);

      const result = await controller.findAll(userId);

      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should call service with correct userId', async () => {
      const userId = 5;
      const mockFeedbackList = [mockFeedback];

      service.findAll.mockResolvedValue(mockFeedbackList);

      await controller.findAll(userId);

      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return feedback with attachments', async () => {
      const userId = 1;
      const mockFeedbackList = [
        {
          ...mockFeedback,
          attachments: ['file1.png', 'file2.pdf', 'file3.log'],
        },
      ];

      service.findAll.mockResolvedValue(mockFeedbackList);

      const result = await controller.findAll(userId);

      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result[0].attachments).toHaveLength(3);
      expect(result[0].attachments).toEqual([
        'file1.png',
        'file2.pdf',
        'file3.log',
      ]);
    });

    it('should return feedback ordered by createdAt desc', async () => {
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

      service.findAll.mockResolvedValue(mockFeedbackList);

      const result = await controller.findAll(userId);

      expect(service.findAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockFeedbackList);
      expect(result[0].id).toBe(3);
      expect(result[1].id).toBe(2);
      expect(result[2].id).toBe(1);
    });
  });
});
