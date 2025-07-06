import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  PaginationDto,
  PaginatedCategoriesDto,
} from './category.dto';
import { Category } from '@prisma/client';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 创建新分类
   * POST /categories
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建新分类', description: '创建一个新的任务分类' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: '创建成功', type: Object })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ErrorResponseDto,
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * 获取所有分类（支持分页）
   * GET /categories?page=1&limit=10
   */
  @Get()
  @ApiOperation({
    summary: '获取分类列表',
    description: '获取所有分类，支持分页',
  })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Object] })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ErrorResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<Category[] | PaginatedCategoriesDto> {
    // 如果提供了分页参数，返回分页结果
    if (paginationDto.page || paginationDto.limit) {
      return this.categoryService.findAllPaginated(paginationDto);
    }

    // 否则返回所有数据
    return this.categoryService.findAll();
  }

  /**
   * 根据ID获取单个分类
   * GET /categories/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取分类',
    description: '通过ID获取单个分类的详细信息',
  })
  @ApiParam({ name: 'id', description: '分类 ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: Object })
  @ApiResponse({
    status: 404,
    description: '分类不存在',
    type: ErrorResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  /**
   * 更新分类
   * PATCH /categories/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新分类', description: '更新分类的信息' })
  @ApiParam({ name: 'id', description: '分类 ID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: '更新成功', type: Object })
  @ApiResponse({
    status: 404,
    description: '分类不存在',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * 删除分类
   * DELETE /categories/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除分类', description: '删除指定的分类' })
  @ApiParam({ name: 'id', description: '分类 ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({
    status: 404,
    description: '分类不存在',
    type: ErrorResponseDto,
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.categoryService.remove(id);
  }
}
