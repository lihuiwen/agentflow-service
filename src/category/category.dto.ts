import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 创建分类的数据传输对象
 */
export class CreateCategoryDto {
  @ApiProperty({ description: '分类标题', example: 'AI开发' })
  title: string;
}

/**
 * 更新分类的数据传输对象
 */
export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: '分类标题', example: 'AI开发' })
  title?: string;
}

/**
 * 分页查询参数
 */
export class PaginationDto {
  @ApiPropertyOptional({ description: '页码', example: 1, minimum: 1 })
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  limit?: number;
}

/**
 * 分页响应数据
 */
export class PaginatedCategoriesDto {
  @ApiProperty({ description: '分类数据列表', type: [Object] })
  data: any[]; // 分类数据

  @ApiProperty({ description: '总数量', example: 20 })
  total: number; // 总数量

  @ApiProperty({ description: '当前页', example: 1 })
  page: number; // 当前页

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number; // 每页数量

  @ApiProperty({ description: '总页数', example: 2 })
  totalPages: number; // 总页数

  @ApiProperty({ description: '是否有下一页', example: true })
  hasNext: boolean; // 是否有下一页

  @ApiProperty({ description: '是否有上一页', example: false })
  hasPrev: boolean; // 是否有上一页
}
