import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '@prisma/client';

/**
 * 创建Job的数据传输对象
 */
export class CreateJobDto {
  @ApiProperty({ description: '任务标题', example: '开发一个AI聊天机器人' })
  jobTitle: string;

  @ApiProperty({ description: '任务分类', example: 'AI开发' })
  category: string;

  @ApiProperty({
    description: '任务描述',
    example: '需要开发一个基于GPT的聊天机器人，具备多轮对话能力',
  })
  description: string;

  @ApiProperty({
    description: '交付物要求',
    example: '完整的源代码、部署文档、使用说明',
  })
  deliverables: string;

  @ApiProperty({ description: '预算', example: { min: 1000, max: 5000 } })
  budget: any; // JSON类型，可以是number或{min, max}对象

  @ApiPropertyOptional({ description: '最大预算', example: 5000 })
  maxBudget?: number;

  @ApiProperty({ description: '截止日期', example: '2024-12-31T23:59:59.000Z' })
  deadline: Date;

  @ApiProperty({ description: '付款方式', example: 'milestone' })
  paymentType: string;

  @ApiProperty({ description: '优先级', example: 'high' })
  priority: string;

  @ApiProperty({ description: '技能要求', example: 'expert' })
  skillLevel: string;

  @ApiProperty({
    description: '标签列表',
    example: ['AI', '聊天机器人', 'GPT'],
    type: [String],
  })
  tags: string[];

  @ApiPropertyOptional({ description: '是否自动分配', example: false })
  autoAssign?: boolean;

  @ApiPropertyOptional({ description: '是否允许竞标', example: true })
  allowBidding?: boolean;

  @ApiPropertyOptional({ description: '是否允许并行执行', example: false })
  allowParallelExecution?: boolean;

  @ApiPropertyOptional({ description: '是否启用托管', example: true })
  escrowEnabled?: boolean;

  @ApiPropertyOptional({ description: '是否公开', example: true })
  isPublic?: boolean;

  @ApiProperty({ description: '钱包地址', example: '0x1234567890abcdef' })
  walletAddress: string;
}

/**
 * 更新Job的数据传输对象
 */
export class UpdateJobDto {
  @ApiPropertyOptional({
    description: '任务标题',
    example: '开发一个AI聊天机器人',
  })
  jobTitle?: string;

  @ApiPropertyOptional({ description: '任务分类', example: 'AI开发' })
  category?: string;

  @ApiPropertyOptional({
    description: '任务描述',
    example: '需要开发一个基于GPT的聊天机器人，具备多轮对话能力',
  })
  description?: string;

  @ApiPropertyOptional({
    description: '交付物要求',
    example: '完整的源代码、部署文档、使用说明',
  })
  deliverables?: string;

  @ApiPropertyOptional({
    description: '预算',
    example: { min: 1000, max: 5000 },
  })
  budget?: any;

  @ApiPropertyOptional({ description: '最大预算', example: 5000 })
  maxBudget?: number;

  @ApiPropertyOptional({
    description: '截止日期',
    example: '2024-12-31T23:59:59.000Z',
  })
  deadline?: Date;

  @ApiPropertyOptional({ description: '付款方式', example: 'milestone' })
  paymentType?: string;

  @ApiPropertyOptional({ description: '优先级', example: 'high' })
  priority?: string;

  @ApiPropertyOptional({ description: '技能要求', example: 'expert' })
  skillLevel?: string;

  @ApiPropertyOptional({
    description: '标签列表',
    example: ['AI', '聊天机器人', 'GPT'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({ description: '任务状态', enum: JobStatus })
  status?: JobStatus;

  @ApiPropertyOptional({ description: '是否自动分配', example: false })
  autoAssign?: boolean;

  @ApiPropertyOptional({ description: '是否允许竞标', example: true })
  allowBidding?: boolean;

  @ApiPropertyOptional({ description: '是否允许并行执行', example: false })
  allowParallelExecution?: boolean;

  @ApiPropertyOptional({ description: '是否启用托管', example: true })
  escrowEnabled?: boolean;

  @ApiPropertyOptional({ description: '是否公开', example: true })
  isPublic?: boolean;
}

/**
 * Job查询过滤参数
 */
export class JobFilterDto {
  @ApiPropertyOptional({ description: '任务分类', example: 'AI开发' })
  category?: string;

  @ApiPropertyOptional({ description: '任务状态', enum: JobStatus })
  status?: JobStatus;

  @ApiPropertyOptional({ description: '优先级', example: 'high' })
  priority?: string;

  @ApiPropertyOptional({ description: '技能要求', example: 'expert' })
  skillLevel?: string;

  @ApiPropertyOptional({
    description: '标签列表',
    example: ['AI', '聊天机器人'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({ description: '是否公开', example: true })
  isPublic?: boolean;

  @ApiPropertyOptional({ description: '最小预算', example: 1000 })
  minBudget?: number;

  @ApiPropertyOptional({ description: '最大预算', example: 5000 })
  maxBudget?: number;

  @ApiPropertyOptional({
    description: '钱包地址',
    example: '0x1234567890abcdef',
  })
  walletAddress?: string;
}

/**
 * 分页查询参数
 */
export class PaginationDto {
  @ApiPropertyOptional({ description: '页码', example: 1, minimum: 1 })
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  limit?: number = 10;
}

/**
 * 分页响应数据
 */
export class PaginatedJobsDto {
  @ApiProperty({ description: 'Job数据列表', type: [Object] })
  data: any[]; // Job数据

  @ApiProperty({ description: '总数量', example: 100 })
  total: number; // 总数量

  @ApiProperty({ description: '当前页', example: 1 })
  page: number; // 当前页

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number; // 每页数量

  @ApiProperty({ description: '总页数', example: 10 })
  totalPages: number; // 总页数

  @ApiProperty({ description: '是否有下一页', example: true })
  hasNext: boolean; // 是否有下一页

  @ApiProperty({ description: '是否有上一页', example: false })
  hasPrev: boolean; // 是否有上一页
}
