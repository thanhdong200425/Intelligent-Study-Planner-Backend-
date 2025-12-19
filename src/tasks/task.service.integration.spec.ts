import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma';
import { CreateTaskDto } from './tasks.dto';
import { TaskType, TaskPriority } from '@prisma/client';
import { ConfigModule } from '@nestjs/config';

describe('TasksService Integration Tests - addMultiple', () => {
  let service: TasksService;
  let prisma: PrismaService;
  let testUserId: number;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [TasksService, PrismaService],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);

    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: `test-tasks-${Date.now()}@example.com`,
        hashedPassword: 'hashed_password_placeholder',
        emailVerifiedAt: new Date(),
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Clean up: Delete all tasks for test user
    await prisma.task.deleteMany({
      where: { userId: testUserId },
    });

    // Delete the test user
    await prisma.user.delete({
      where: { id: testUserId },
    });

    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up tasks after each test
    await prisma.task.deleteMany({
      where: { userId: testUserId },
    });
  });

  describe('addMultiple', () => {
    it('should create multiple tasks successfully with all required fields', async () => {
      const tasksToCreate: CreateTaskDto[] = [
        {
          title: 'Complete homework assignment',
          description: 'Math homework chapter 5',
          type: TaskType.pset,
          estimateMinutes: 120,
          priority: TaskPriority.high,
        },
        {
          title: 'Read textbook chapter',
          description: 'Physics chapter 3',
          type: TaskType.reading,
          estimateMinutes: 60,
          priority: TaskPriority.medium,
        },
        {
          title: 'Write essay',
          type: TaskType.writing,
          estimateMinutes: 180,
          priority: TaskPriority.high,
        },
      ];

      // Call the service method
      await service.addMultiple(testUserId, tasksToCreate);

      // Verify tasks were created
      const createdTasks = await prisma.task.findMany({
        where: { userId: testUserId },
        orderBy: { createdAt: 'asc' },
      });

      expect(createdTasks).toHaveLength(3);

      // Verify first task
      expect(createdTasks[0]).toMatchObject({
        title: 'Complete homework assignment',
        description: 'Math homework chapter 5',
        type: TaskType.pset,
        estimateMinutes: 120,
        priority: TaskPriority.high,
        userId: testUserId,
        completed: false,
      });

      // Verify second task
      expect(createdTasks[1]).toMatchObject({
        title: 'Read textbook chapter',
        description: 'Physics chapter 3',
        type: TaskType.reading,
        estimateMinutes: 60,
        priority: TaskPriority.medium,
        userId: testUserId,
        completed: false,
      });

      // Verify third task
      expect(createdTasks[2]).toMatchObject({
        title: 'Write essay',
        type: TaskType.writing,
        estimateMinutes: 180,
        priority: TaskPriority.high,
        userId: testUserId,
        completed: false,
      });

      // Verify that all tasks have IDs and timestamps
      createdTasks.forEach((task) => {
        expect(task.id).toBeDefined();
        expect(task.createdAt).toBeInstanceOf(Date);
        expect(task.updatedAt).toBeInstanceOf(Date);
      });
    });

    it('should create tasks with minimal required fields only', async () => {
      const tasksToCreate: CreateTaskDto[] = [
        {
          title: 'Quick task 1',
          type: TaskType.other,
          estimateMinutes: 30,
        },
        {
          title: 'Quick task 2',
          type: TaskType.coding,
          estimateMinutes: 45,
        },
      ];

      await service.addMultiple(testUserId, tasksToCreate);

      const createdTasks = await prisma.task.findMany({
        where: { userId: testUserId },
        orderBy: { createdAt: 'asc' },
      });

      expect(createdTasks).toHaveLength(2);

      // Verify minimal fields are set
      expect(createdTasks[0]).toMatchObject({
        title: 'Quick task 1',
        type: TaskType.other,
        estimateMinutes: 30,
        userId: testUserId,
      });

      // Verify optional fields are null or default
      expect(createdTasks[0].description).toBeNull();
      expect(createdTasks[0].courseId).toBeNull();
      expect(createdTasks[0].deadlineId).toBeNull();
    });

    it('should handle empty array by creating no tasks', async () => {
      const tasksToCreate: CreateTaskDto[] = [];

      await service.addMultiple(testUserId, tasksToCreate);

      const createdTasks = await prisma.task.findMany({
        where: { userId: testUserId },
      });

      expect(createdTasks).toHaveLength(0);
    });

    it('should set correct default values for tasks', async () => {
      const tasksToCreate: CreateTaskDto[] = [
        {
          title: 'Task with defaults',
          type: TaskType.coding,
          estimateMinutes: 45,
        },
      ];

      await service.addMultiple(testUserId, tasksToCreate);

      const createdTasks = await prisma.task.findMany({
        where: { userId: testUserId },
      });

      expect(createdTasks).toHaveLength(1);

      // Verify default values
      expect(createdTasks[0].completed).toBe(false);
      expect(createdTasks[0].actualMinutes).toBeNull();
      expect(createdTasks[0].priority).toBe(TaskPriority.medium); // Default from schema
    });
  });
});
