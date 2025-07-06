# NestJS 使用经验总结

## 1. 项目结构最佳实践

### 模块化设计

```
src/
├── module-name/
│   ├── module-name.dto.ts      # 数据传输对象
│   ├── module-name.service.ts  # 业务逻辑层
│   ├── module-name.controller.ts # 控制器层
│   ├── module-name.module.ts   # 模块配置
│   └── module-name.service.spec.ts # 单元测试
```

**经验要点**：

- 每个功能模块独立目录
- 文件命名遵循 `模块名.类型.ts` 格式
- 保持层次分离：Controller → Service → Repository

## 2. 数据传输对象 (DTO) 设计

### 基础DTO结构

```typescript
// 创建数据DTO
export class CreateEntityDto {
  field: string;
}

// 更新数据DTO
export class UpdateEntityDto {
  field?: string; // 可选字段
}

// 分页查询DTO
export class PaginationDto {
  @Type(() => Number)
  page?: number = 1;

  @Type(() => Number)
  limit?: number = 10;
}
```

**经验要点**：

- 使用 `@Type(() => Number)` 进行类型转换
- 更新DTO字段设为可选
- 提供合理的默认值

## 3. 全局验证管道配置

### 必要配置 (main.ts)

```typescript
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(
  new ValidationPipe({
    transform: true, // 启用自动类型转换
    transformOptions: {
      enableImplicitConversion: true, // 启用隐式类型转换
    },
  }),
);
```

**经验要点**：

- 必须配置全局验证管道才能实现查询参数的类型转换
- `transform: true` 是关键配置
- 解决查询参数字符串转数字的问题

## 4. 分页功能实现

### 服务层分页逻辑

```typescript
async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResult> {
  const { page = 1, limit = 10 } = paginationDto;
  const skip = (page - 1) * limit;

  // 并行查询数据和总数
  const [data, total] = await Promise.all([
    this.prisma.entity.findMany({
      skip,
      take: limit,
      orderBy: { field: 'asc' },
    }),
    this.prisma.entity.count(),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1,
  };
}
```

**经验要点**：

- 使用 `Promise.all` 并行查询提高性能
- 提供完整的分页元信息
- 支持可选分页（兼容非分页查询）

### 控制器层分页处理

```typescript
@Get()
async findAll(@Query() paginationDto: PaginationDto) {
  // 智能分页：有分页参数时分页，无参数时返回全部
  if (paginationDto.page || paginationDto.limit) {
    return this.service.findAllPaginated(paginationDto);
  }
  return this.service.findAll();
}
```

**经验要点**：

- 支持可选分页，提高API灵活性
- 使用 `@Query()` 装饰器自动解析查询参数

## 5. 错误处理最佳实践

### 全局异常过滤器

```typescript
// src/common/filters/global-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status: number;
    let message: string | string[];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '服务器内部错误';
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

### 全局过滤器注册

```typescript
// main.ts
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 注册全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(3000);
}
```

### 业务层错误处理

```typescript
async findOne(id: string): Promise<Entity> {
  const entity = await this.prisma.entity.findUnique({
    where: { id },
  });

  if (!entity) {
    throw new NotFoundException(`资源 ID ${id} 不存在`);
  }

  return entity;
}
```

**经验要点**：

- 使用 `@Catch()` 捕获所有异常
- 区分HTTP异常和系统异常处理
- 统一错误响应格式，包含时间戳和请求路径
- 生产环境隐藏敏感错误信息
- 在服务层抛出具体的业务异常
- 全局过滤器自动处理异常格式化

## 6. HTTP状态码规范

### RESTful API状态码

```typescript
@Post()
@HttpCode(HttpStatus.CREATED) // 201
async create(@Body() dto: CreateDto) {}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT) // 204
async remove(@Param('id') id: string): Promise<void> {}
```

**经验要点**：

- 创建资源返回201
- 删除资源返回204
- 明确指定HTTP状态码

## 7. 模块依赖管理

### 模块导入导出

```typescript
@Module({
  imports: [PrismaModule], // 导入依赖模块
  controllers: [EntityController],
  providers: [EntityService],
  exports: [EntityService], // 导出服务供其他模块使用
})
export class EntityModule {}
```

**经验要点**：

- 在根模块中导入所有功能模块
- 合理使用 `exports` 共享服务
- 避免循环依赖

## 8. 单元测试要点

### 服务层测试结构

```typescript
const mockRepository = {
  entity: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(), // 分页功能需要
  },
};

// 测试分页逻辑
it('should return paginated results', async () => {
  // 模拟数据和总数
  mockRepository.entity.findMany.mockResolvedValue(mockData);
  mockRepository.entity.count.mockResolvedValue(mockTotal);

  const result = await service.findAllPaginated({ page: 1, limit: 10 });

  expect(result.hasNext).toBe(true);
  expect(result.totalPages).toBe(expectedPages);
});
```

**经验要点**：

- 使用Mock对象模拟数据库操作
- 测试边界情况（首页、末页）
- 验证分页计算逻辑

## 9. 常见问题解决

### 查询参数类型转换问题

**问题**：查询参数默认是字符串，导致Prisma类型错误
**解决**：配置全局ValidationPipe + 使用@Type装饰器

### 分页性能优化

**问题**：大数据量时分页查询慢
**解决**：使用Promise.all并行查询数据和总数

## 10. 开发效率提升

### 代码生成命令

```bash
# 生成完整模块
nest g module module-name
nest g controller module-name
nest g service module-name

# 生成资源（包含CRUD）
nest g resource module-name
```

**经验要点**：

- 使用CLI快速生成模板代码
- 保持代码风格统一
- 合理使用装饰器简化代码
