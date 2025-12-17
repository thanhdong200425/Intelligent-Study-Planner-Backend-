import { Test, TestingModule } from '@nestjs/testing';
import { TaskImageService } from './task-image.service';
import { GeminiService } from 'src/gemini/gemini.service';
import { TasksService } from './tasks.service';
import { Logger, BadRequestException } from '@nestjs/common';

describe('TaskImageService', () => {
  let service: TaskImageService;
  let logger: Logger;

  const mockGeminiService = {
    analyzeImageForTasks: jest.fn(),
  } as unknown as GeminiService;

  const mockTasksService = {
    addMultiple: jest.fn(),
  } as unknown as TasksService;

  const mockLogger = {
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  } as unknown as Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskImageService,
        {
          provide: GeminiService,
          useValue: mockGeminiService,
        },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<TaskImageService>(TaskImageService);
    logger = module.get<Logger>(Logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should throw BadRequestException when no file is provided', () => {
      expect(() => service.validateFile(null as any)).toThrow(
        BadRequestException,
      );
      expect(() => service.validateFile(undefined as any)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid mime type', () => {
      const invalidFile = {
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      expect(() => service.validateFile(invalidFile)).toThrow(
        BadRequestException,
      );

      try {
        service.validateFile(invalidFile);
      } catch (error) {
        expect((error as BadRequestException).message).toContain(
          'Invalid file type',
        );
      }
    });

    it('should throw BadRequestException when file size exceeds 10MB', () => {
      const largeFile = {
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024 + 1, // just over 10MB
      } as Express.Multer.File;

      expect(() => service.validateFile(largeFile)).toThrow(
        BadRequestException,
      );

      try {
        service.validateFile(largeFile);
      } catch (error) {
        expect((error as BadRequestException).message).toContain(
          'File size exceeds 10MB',
        );
      }
    });

    it('should return true for a valid jpeg file', () => {
      const validFile = {
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      } as Express.Multer.File;

      const result = service.validateFile(validFile);
      expect(result).toBe(true);
    });

    it('should return true for a valid png file', () => {
      const validFile = {
        mimetype: 'image/png',
        size: 512 * 1024, // 512KB
      } as Express.Multer.File;

      const result = service.validateFile(validFile);
      expect(result).toBe(true);
    });

    it('should return true for a valid jpg file', () => {
      const validFile = {
        mimetype: 'image/jpg',
        size: 2 * 1024 * 1024, // 2MB
      } as Express.Multer.File;

      const result = service.validateFile(validFile);
      expect(result).toBe(true);
    });
  });
});
