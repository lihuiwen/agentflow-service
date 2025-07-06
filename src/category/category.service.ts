import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  PaginationDto,
  PaginatedCategoriesDto,
} from './category.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建新分类
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  /**
   * 获取所有分类（不分页）
   */
  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { title: 'asc' }, // 按标题升序排列
    });
  }

  /**
   * 获取分类（分页）
   */
  async findAllPaginated(
    paginationDto: PaginationDto,
  ): Promise<PaginatedCategoriesDto> {
    const { page = 1, limit = 10 } = paginationDto;

    // 计算跳过的记录数
    const skip = (page - 1) * limit;

    // 并行查询数据和总数
    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { title: 'asc' },
      }),
      this.prisma.category.count(),
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: categories,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  /**
   * 根据ID获取单个分类
   */
  async findOne(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`分类 ID ${id} 不存在`);
    }

    return category;
  }

  /**
   * 更新分类
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    // 先检查分类是否存在
    await this.findOne(id);

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  /**
   * 删除分类
   */
  async remove(id: string): Promise<Category> {
    // 先检查分类是否存在
    await this.findOne(id);

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
