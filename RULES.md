# Quy Tắc Phát Triển Backend

## 1. Kiến Trúc Tổng Quan

### 1.1. NestJS Framework

- **Sử dụng NestJS** làm framework chính cho backend
- Tuân theo kiến trúc module-based của NestJS
- Mỗi feature nên được tổ chức thành một module riêng biệt

### 1.2. Cấu Trúc Module

Mỗi module nên có cấu trúc như sau:

```
src/
  ├── feature-name/
  │   ├── feature-name.controller.ts    # Xử lý HTTP requests
  │   ├── feature-name.service.ts        # Business logic
  │   ├── feature-name.module.ts         # Module definition
  │   ├── feature-name.dto.ts            # Data Transfer Objects
```

### 1.3. Dependency Injection

- **Luôn sử dụng Dependency Injection** của NestJS
- Inject dependencies thông qua constructor
- Không tạo instance trực tiếp, luôn inject qua constructor

```typescript
// ✅ Đúng
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}
}

// ❌ Sai
@Injectable()
export class TasksService {
  private prisma = new PrismaService(); // Không làm như này
}
```

## 2. Database với Prisma

### 2.1. Sử Dụng Prisma ORM

- **Bắt buộc sử dụng Prisma** cho tất cả database operations
- Không sử dụng raw SQL queries trừ khi thực sự cần thiết
- Sử dụng PrismaService được inject từ PrismaModule

### 2.2. Prisma Patterns

```typescript
// ✅ Đúng - Sử dụng Prisma types
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: number, data: Prisma.TaskCreateInput) {
    return this.prisma.task.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }
}
```

### 2.3. Database Migrations

- **Luôn sử dụng Prisma Migrate** để quản lý schema changes
- Không chỉnh sửa database trực tiếp
- Chạy migration trước khi deploy:
  ```bash
  npx prisma migrate dev
  ```

### 2.4. Schema Management

- Định nghĩa tất cả models trong `prisma/schema.prisma`
- Sử dụng naming convention: `snake_case` cho database columns, `camelCase` cho Prisma fields
- Sử dụng `@map()` để map giữa Prisma field và database column

## 3. Controllers

### 3.1. Controller Responsibilities

- **Controllers chỉ xử lý HTTP requests/responses**
- Không chứa business logic
- Chỉ validate input, gọi service methods, và trả về response
- Sử dụng decorators từ `@nestjs/common` cho routing

### 3.2. Controller Pattern

```typescript
@UseGuards(JwtAuthGuard) // Áp dụng guard ở controller level nếu tất cả routes cần auth
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  create(@UserId() userId: number, @Body() body: CreateTaskDto) {
    return this.tasks.create(userId, body);
  }

  @Get()
  list(@UserId() userId: number, @Query('status') status?: string) {
    return this.tasks.list(userId, status);
  }
}
```

### 3.3. Route Decorators

- Sử dụng đúng HTTP method decorators: `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`
- `@Put()` cho full update, `@Patch()` cho partial update
- Sử dụng `@Param()` với `ParseIntPipe` cho route parameters
- Sử dụng `@Query()` cho query parameters
- Sử dụng `@Body()` cho request body

### 3.4. Authentication

- **Sử dụng `@UseGuards(JwtAuthGuard)`** cho các routes cần authentication
- Áp dụng guard ở controller level nếu tất cả routes cần auth
- Áp dụng guard ở method level nếu chỉ một số routes cần auth
- Sử dụng `@UserId()` decorator để lấy userId từ JWT token

```typescript
// ✅ Áp dụng ở controller level
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  @Get()
  list(@UserId() userId: number) {
    // userId được lấy từ JWT token
  }
}
```

## 4. Services

### 4.1. Service Responsibilities

- **Services chứa tất cả business logic**
- Services xử lý database operations thông qua PrismaService
- Services validate ownership và permissions
- Services throw exceptions khi cần thiết

### 4.2. Service Pattern

```typescript
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async update(userId: number, id: number, data: Prisma.TaskUpdateInput) {
    // Luôn kiểm tra ownership trước khi update
    const existing = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException('Task not found');

    return this.prisma.task.update({ where: { id }, data });
  }
}
```

### 4.3. User Ownership Validation

- **Luôn validate user ownership** trước khi thực hiện update/delete
- Sử dụng `findFirst` với `where: { id, userId }` để kiểm tra
- Throw `NotFoundException` nếu resource không tồn tại hoặc không thuộc về user

### 4.4. Service Methods Naming

- `create()` - Tạo mới resource
- `list()` hoặc `findAll()` - Lấy danh sách
- `findOne()` - Lấy một resource
- `update()` - Cập nhật resource
- `remove()` hoặc `delete()` - Xóa resource
- Sử dụng tên động từ rõ ràng cho các methods khác (ví dụ: `toggleComplete()`)

## 5. DTOs (Data Transfer Objects)

### 5.1. Validation với class-validator

- **Bắt buộc sử dụng class-validator** cho tất cả DTOs
- Sử dụng decorators từ `class-validator` để validate input
- DTOs phải là classes, không phải interfaces

### 5.2. DTO Pattern

```typescript
import {
  IsString,
  IsOptional,
  IsInt,
  MinLength,
  IsEnum,
} from 'class-validator';
import { TaskPriority, TaskType } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsOptional()
  @IsInt()
  courseId?: number;

  @IsEnum(TaskType)
  type!: TaskType;

  @IsInt()
  @Min(1)
  estimateMinutes!: number;
}
```

### 5.3. Validation Rules

- Sử dụng `!` (non-null assertion) cho required fields
- Sử dụng `?` (optional) cho optional fields
- Kết hợp nhiều decorators khi cần (ví dụ: `@IsOptional() @IsString()`)
- Sử dụng `@IsEnum()` cho enum values từ Prisma
- Sử dụng `@Min()`, `@Max()`, `@MinLength()`, `@MaxLength()` cho constraints

### 5.4. Separate DTOs

- Tạo DTO riêng cho Create và Update operations
- `CreateTaskDto` - cho POST requests
- `UpdateTaskDto` - cho PUT/PATCH requests (tất cả fields optional)

```typescript
export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsInt()
  courseId?: number;

  // Tất cả fields đều optional
}
```

## 6. Authentication & Authorization

### 6.1. JWT Authentication

- **Sử dụng JWT tokens** cho authentication
- Access token trong Authorization header
- Refresh token trong httpOnly cookie
- Sử dụng Passport với JWT strategy

### 6.2. Guards

- `JwtAuthGuard` - Bảo vệ routes cần authentication
- `RefreshTokenGuard` - Cho refresh token endpoint
- Tạo custom guards nếu cần authorization logic phức tạp

### 6.3. User ID Decorator

- **Sử dụng `@UserId()` decorator** để lấy userId từ JWT token
- Decorator này được định nghĩa trong `src/common/user-id.decorator.ts`
- Luôn sử dụng decorator này thay vì parse token manually

```typescript
@Get()
list(@UserId() userId: number) {
  return this.tasks.list(userId);
}
```

## 7. Error Handling

### 7.1. NestJS Exceptions

- **Sử dụng NestJS built-in exceptions**:
  - `NotFoundException` - 404
  - `BadRequestException` - 400
  - `UnauthorizedException` - 401
  - `ForbiddenException` - 403
  - `ConflictException` - 409
  - `InternalServerErrorException` - 500

### 7.2. Error Handling Pattern

```typescript
async update(userId: number, id: number, data: Prisma.TaskUpdateInput) {
  const existing = await this.prisma.task.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new NotFoundException('Task not found');
  }

  return this.prisma.task.update({ where: { id }, data });
}
```

### 7.3. Error Messages

- Cung cấp error messages rõ ràng và hữu ích
- Không expose thông tin nhạy cảm trong error messages
- Sử dụng messages nhất quán trong toàn bộ application

## 8. Modules

### 8.1. Module Structure

- Mỗi feature có một module riêng
- Module imports các dependencies cần thiết
- Module exports services nếu cần dùng ở module khác

### 8.2. Module Pattern

```typescript
@Module({
  imports: [PrismaModule], // Import dependencies
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService], // Export nếu cần dùng ở module khác
})
export class TasksModule {}
```

### 8.3. Shared Modules

- `PrismaModule` - Global module, import ở mọi module cần database
- `ConfigModule` - Global module cho environment variables
- `AuthModule` - Module cho authentication
- `MailModule` - Module cho email services

## 9. TypeScript

### 9.1. Type Safety

- **Luôn sử dụng TypeScript types**
- Sử dụng Prisma types (`Prisma.TaskCreateInput`, `Prisma.TaskUpdateInput`)
- Tránh sử dụng `any`, sử dụng `unknown` nếu cần
- Sử dụng type inference khi có thể

### 9.2. Type Definitions

- Sử dụng Prisma generated types
- Định nghĩa types cho DTOs
- Sử dụng enums từ Prisma schema

## 10. Environment Variables

### 10.1. ConfigModule

- **Sử dụng @nestjs/config** để quản lý environment variables
- ConfigModule được import global trong AppModule
- Sử dụng `ConfigService` để access environment variables

### 10.2. Environment Variables Pattern

```typescript
constructor(private readonly configService: ConfigService) {}

const dbUrl = this.configService.get<string>('DATABASE_URL');
```

**Những điểm quan trọng cần nhớ:**

1. ✅ NestJS module-based architecture
2. ✅ Prisma cho database operations
3. ✅ Controllers xử lý HTTP, Services xử lý business logic
4. ✅ DTOs với class-validator cho validation
5. ✅ User ownership validation trong services
6. ✅ Proper error handling với NestJS exceptions
7. ✅ TypeScript type safety
8. ✅ Dependency injection qua constructor
9. ✅ Consistent code organization và naming
