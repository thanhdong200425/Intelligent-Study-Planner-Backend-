import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CoursesController } from 'src/courses/courses.controller';
import { CoursesService } from 'src/courses/courses.service';
import { CreateCourseDto } from 'src/courses/dto/create-course.dto';
import { UpdateCourseDto } from 'src/courses/dto/update-course.dto';

describe('CoursesController', () => {
  let controller: CoursesController;

  const mockCoursesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    // Define the testing (mocked) module like in NestJS applications
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
          useValue: mockCoursesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock the guard to always allow access
      .compile();

    // Get the controller instance from the testing module
    controller = module.get(CoursesController);
  });

  it('module should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a course', () => {
      const userId = 1;
      const dto: CreateCourseDto = {
        name: 'Course 1',
        color: '#FFFFFF',
      };
      const course = { id: 1, ...dto };
      mockCoursesService.create.mockReturnValue(course);
      const result = controller.create(userId, dto);
      expect(result).toEqual(course);
      expect(mockCoursesService.create).toHaveBeenCalledWith(userId, dto);
    });
  });

  describe('list', () => {
    it('should list all courses', () => {
      const userId = 1;
      const courses = [
        { id: 1, name: 'Course 1', color: '#FFFFFF' },
        { id: 2, name: 'Course 2', color: '#000000' },
      ];
      mockCoursesService.findAll.mockReturnValue(courses);
      const result = controller.list(userId);
      expect(result).toEqual(courses);
      expect(mockCoursesService.findAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a course', () => {
      // Prepare the existing course
      const userId = 1;
      const id = 1;
      const dto: UpdateCourseDto = {
        name: 'Course 1',
        color: '#FFFFFF',
      };
      const currentCourse = { id: 1, ...dto };

      // Create a new mock course
      const newCourse = { id: 1, name: 'Course 2', ...dto };

      // Mock the update method to return the new course inside the service
      mockCoursesService.update.mockReturnValue(newCourse);

      // Call the update method
      const result = controller.update(userId, id, dto);
      expect(result).toEqual(newCourse);
      expect(mockCoursesService.update).toHaveBeenCalledWith(userId, id, dto);
    });
  });
});
