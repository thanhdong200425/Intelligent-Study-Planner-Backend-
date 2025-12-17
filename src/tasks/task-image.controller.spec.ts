import { Test, TestingModule } from '@nestjs/testing';
import { TaskImageController } from './task-image.controller';
import { TaskImageService } from './task-image.service';
import { BadRequestException, HttpStatus } from '@nestjs/common';

describe('TaskImageController', () => {
  let controller: TaskImageController;
  let taskImageService: TaskImageService;

  const mockTaskImageService = {
    handleSendImageToGemini: jest.fn(),
  } as unknown as TaskImageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskImageController],
      providers: [
        {
          provide: TaskImageService,
          useValue: mockTaskImageService,
        },
      ],
    }).compile();

    controller = module.get<TaskImageController>(TaskImageController);
    taskImageService = module.get<TaskImageService>(TaskImageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('previewImageTasks', () => {
    it('should throw BadRequestException when no file is provided', async () => {
      const body = {};
      const userId = 1;

      await expect(
        controller.previewImageTasks(undefined as any, body as any, userId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should call TaskImageService and return formatted response', async () => {
      const mockFile = {
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 1024,
      } as Express.Multer.File;

      const body = {
        additionalContext: 'Please extract tasks from this image',
      };
      const userId = 123;

      const analysisResult = {
        tasks: [
          {
            title: 'Task 1',
            description: 'Description 1',
          },
          {
            title: 'Task 2',
            description: 'Description 2',
          },
        ],
      };

      (taskImageService.handleSendImageToGemini as jest.Mock).mockResolvedValue(
        analysisResult,
      );

      const result = await controller.previewImageTasks(
        mockFile,
        body as any,
        userId,
      );

      expect(taskImageService.handleSendImageToGemini).toHaveBeenCalledTimes(1);
      expect(taskImageService.handleSendImageToGemini).toHaveBeenCalledWith(
        mockFile,
        body.additionalContext,
      );

      expect(result).toEqual({
        tasks: analysisResult.tasks,
        message: 'Tasks previewed successfully',
        statusCode: HttpStatus.OK,
      });
    });
  });
});
