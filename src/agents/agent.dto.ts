import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建Agent的数据传输对象
 */
export class CreateAgentDto {
  @ApiProperty({ description: 'Agent名称', example: 'AI助手' })
  agentName: string;

  @ApiProperty({
    description: 'Agent地址',
    example: 'https://example.com/agent',
  })
  agentAddress: string;

  @ApiProperty({
    description: 'Agent描述',
    example: '专业的AI助手，擅长处理各种任务',
  })
  description: string;

  @ApiProperty({ description: '作者简介', example: '资深AI开发者' })
  authorBio: string;

  @ApiProperty({ description: 'Agent分类', example: 'AI' })
  agentClassification: string;

  @ApiProperty({
    description: '标签列表',
    example: ['AI', '助手', '自动化'],
    type: [String],
  })
  tags: string[];

  @ApiPropertyOptional({ description: '是否私有', example: false })
  isPrivate?: boolean;

  @ApiPropertyOptional({ description: '是否自动接受任务', example: true })
  autoAcceptJobs?: boolean;

  @ApiPropertyOptional({ description: '合约类型', example: 'standard' })
  contractType?: string;

  @ApiProperty({ description: '钱包地址', example: '0x1234567890abcdef' })
  walletAddress: string;
}

/**
 * 更新Agent的数据传输对象
 */
export class UpdateAgentDto {
  @ApiPropertyOptional({ description: 'Agent名称', example: 'AI助手' })
  agentName?: string;

  @ApiPropertyOptional({
    description: 'Agent地址',
    example: 'https://example.com/agent',
  })
  agentAddress?: string;

  @ApiPropertyOptional({
    description: 'Agent描述',
    example: '专业的AI助手，擅长处理各种任务',
  })
  description?: string;

  @ApiPropertyOptional({ description: '作者简介', example: '资深AI开发者' })
  authorBio?: string;

  @ApiPropertyOptional({ description: 'Agent分类', example: 'AI' })
  agentClassification?: string;

  @ApiPropertyOptional({
    description: '标签列表',
    example: ['AI', '助手', '自动化'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({ description: '是否私有', example: false })
  isPrivate?: boolean;

  @ApiPropertyOptional({ description: '是否自动接受任务', example: true })
  autoAcceptJobs?: boolean;

  @ApiPropertyOptional({ description: '合约类型', example: 'standard' })
  contractType?: string;

  @ApiPropertyOptional({ description: '是否激活', example: true })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: '钱包地址',
    example: '0x1234567890abcdef',
  })
  walletAddress?: string;
}

/**
 * Agent查询过滤参数
 */
export class AgentFilterDto {
  @ApiPropertyOptional({ description: 'Agent分类', example: 'AI' })
  agentClassification?: string;

  @ApiPropertyOptional({
    description: '标签列表',
    example: ['AI', '助手'],
    type: [String],
  })
  tags?: string[];

  @ApiPropertyOptional({ description: '是否激活', example: true })
  isActive?: boolean;

  @ApiPropertyOptional({ description: '是否私有', example: false })
  isPrivate?: boolean;

  @ApiPropertyOptional({ description: '最小声誉值', example: 80 })
  minReputation?: number;
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
export class PaginatedAgentsDto {
  @ApiProperty({ description: 'Agent数据列表', type: [Object] })
  data: any[]; // Agent数据

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
