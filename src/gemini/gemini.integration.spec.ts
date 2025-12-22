import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { ExtractedTask, TaskArraySchema } from './types';
import axios from 'axios';

describe('GeminiService Integration Tests', () => {
  let service: GeminiService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [GeminiService],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeImageForTasks return correct output', () => {
    it('should fetch an image from URL and extract structured tasks', async () => {
      // Use a sample image URL - you can replace this with any publicly accessible image URL
      // For this example, I'm using a placeholder. In real tests, use an image that contains tasks/todo items
      const imageUrl =
        'https://c7.alamy.com/comp/2RHXF51/top-view-of-notebook-with-handwritten-to-do-list-text-placed-on-wooden-table-2RHXF51.jpg'; // Sample todo list image

      // Fetch the image from the URL
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      // Convert to buffer
      const imageBuffer = Buffer.from(response.data);

      // Get the MIME type from response headers
      const mimeType = response.headers['content-type'] || 'image/jpeg';

      // Additional context to help Gemini understand what to look for
      const additionalContext =
        'This is a test image. Please extract any visible tasks or to-do items.';

      // Call the service method
      const result = await service.analyzeImageForTasks(
        imageBuffer,
        mimeType,
        additionalContext,
      );

      // Verify the response structure
      expect(result).toBeDefined();
      expect(result).toHaveProperty('tasks');
      expect(result).toHaveProperty('rawResponse');
      expect(Array.isArray(result.tasks)).toBe(true);

      // Verify the raw response is valid JSON
      expect(() => JSON.parse(result.rawResponse)).not.toThrow();

      // Verify the response matches the schema
      const parsedResponse = JSON.parse(result.rawResponse);
      expect(() => TaskArraySchema.parse(parsedResponse)).not.toThrow();

      // If tasks were extracted, verify their structure
      if (result.tasks.length > 0) {
        result.tasks.forEach((task: ExtractedTask) => {
          // Required fields
          expect(task).toHaveProperty('title');
          expect(task.title).toBeTruthy();
          expect(typeof task.title).toBe('string');
          expect(task.title.length).toBeGreaterThan(0);
          expect(task.title.length).toBeLessThanOrEqual(255);

          // Optional fields - if present, verify their types and constraints
          if (task.description !== undefined) {
            expect(typeof task.description).toBe('string');
            expect(task.description.length).toBeLessThanOrEqual(1000);
          }

          if (task.priority !== undefined) {
            expect(['low', 'medium', 'high']).toContain(task.priority);
          }

          if (task.dueDate !== undefined) {
            expect(typeof task.dueDate).toBe('string');
            // Verify YYYY-MM-DD format
            expect(task.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          }

          if (task.estimateMinutes !== undefined) {
            expect(typeof task.estimateMinutes).toBe('number');
            expect(task.estimateMinutes).toBeGreaterThanOrEqual(1);
            expect(task.estimateMinutes).toBeLessThanOrEqual(1440);
          }

          if (task.type !== undefined) {
            expect(['reading', 'coding', 'writing', 'pset', 'other']).toContain(
              task.type,
            );
          }
        });
      }

      console.log('✅ Test passed! Gemini returned structured output:');
      console.log(JSON.stringify(result, null, 2));
    }, 60000); // 60 second timeout for API calls

    // it('should handle image URLs with different MIME types', async () => {
    //   // Test with a PNG image URL
    //   const imageUrl =
    //     'https://via.placeholder.com/800x600.png/09f/fff?text=Sample+Task+List';

    //   const response = await axios.get(imageUrl, {
    //     responseType: 'arraybuffer',
    //   });

    //   const imageBuffer = Buffer.from(response.data);
    //   const mimeType = response.headers['content-type'] || 'image/png';

    //   const result = await service.analyzeImageForTasks(
    //     imageBuffer,
    //     mimeType,
    //     'Extract any tasks from this image.',
    //   );

    //   // Verify basic structure
    //   expect(result).toBeDefined();
    //   expect(result).toHaveProperty('tasks');
    //   expect(result).toHaveProperty('rawResponse');
    //   expect(Array.isArray(result.tasks)).toBe(true);

    //   // Verify it's valid JSON that matches the schema
    //   const parsedResponse = JSON.parse(result.rawResponse);
    //   expect(() => TaskArraySchema.parse(parsedResponse)).not.toThrow();
    // }, 60000);

    // it('should return empty tasks array for images without visible tasks', async () => {
    //   // Use a simple blank or non-task image
    //   const imageUrl = 'https://via.placeholder.com/400x400.png/ffffff/ffffff';

    //   const response = await axios.get(imageUrl, {
    //     responseType: 'arraybuffer',
    //   });

    //   const imageBuffer = Buffer.from(response.data);
    //   const mimeType = response.headers['content-type'] || 'image/png';

    //   const result = await service.analyzeImageForTasks(imageBuffer, mimeType);

    //   // Should still return valid structure even with no tasks
    //   expect(result).toBeDefined();
    //   expect(result).toHaveProperty('tasks');
    //   expect(Array.isArray(result.tasks)).toBe(true);

    //   // The response should be valid according to schema
    //   const parsedResponse = JSON.parse(result.rawResponse);
    //   expect(() => TaskArraySchema.parse(parsedResponse)).not.toThrow();
    // }, 60000);
  });

  describe('Environment Configuration', () => {
    it('should have GEMINI_API_KEY configured', () => {
      const apiKey = configService.get<string>('GEMINI_API_KEY');
      expect(apiKey).toBeDefined();
      expect(apiKey).toBeTruthy();
      expect(typeof apiKey).toBe('string');
    });

    it('should have GEMINI_MODEL configured', () => {
      const model = configService.get<string>('GEMINI_MODEL');
      expect(model).toBeDefined();
      expect(model).toBeTruthy();
      expect(typeof model).toBe('string');
    });
  });
});

describe('GeminiService Ephemeral Token', () => {
  let service: GeminiService;
  let configService: ConfigService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' })],
      providers: [GeminiService],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestEphemeralToken', () => {
    it('should return an ephemeral token', async () => {
      const { token } = await service.requestEphemeralToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token?.length).toBeGreaterThan(0);
      console.log(token);
    });
  });
});
