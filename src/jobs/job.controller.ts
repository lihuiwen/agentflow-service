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
import { JobService } from './job.service';
import {
  CreateJobDto,
  UpdateJobDto,
  PaginationDto,
  PaginatedJobsDto,
  JobFilterDto,
} from './job.dto';
import { Job, JobStatus } from '@prisma/client';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('jobs')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  /**
   * 创建新Job
   * POST /jobs
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建新任务', description: '发布一个新的工作任务' })
  @ApiBody({ type: CreateJobDto })
  @ApiResponse({ status: 201, description: '创建成功', type: Object })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ErrorResponseDto,
  })
  async create(@Body() createJobDto: CreateJobDto): Promise<Job> {
    return this.jobService.create(createJobDto);
  }

  /**
   * 获取所有Job（支持分页和过滤）
   * GET /jobs?page=1&limit=10&status=OPEN&category=AI
   */
  @Get()
  @ApiOperation({
    summary: '获取任务列表',
    description: '获取所有任务，支持分页和过滤',
  })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '任务状态',
    enum: JobStatus,
  })
  @ApiQuery({ name: 'category', required: false, description: '任务分类' })
  @ApiQuery({ name: 'priority', required: false, description: '优先级' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Object] })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ErrorResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: JobFilterDto,
  ): Promise<Job[] | PaginatedJobsDto> {
    // 如果提供了分页参数，返回分页结果
    if (paginationDto.page || paginationDto.limit) {
      return this.jobService.findAllPaginated(paginationDto, filterDto);
    }

    // 否则返回所有数据
    return this.jobService.findAll(filterDto);
  }

  /**
   * 获取开放状态的Job列表
   * GET /jobs/open
   */
  @Get('open')
  @ApiOperation({
    summary: '获取开放任务列表',
    description: '获取所有处于开放状态的任务',
  })
  @ApiResponse({ status: 200, description: '获取成功', type: [Object] })
  async findOpenJobs(): Promise<Job[]> {
    return this.jobService.findOpenJobs();
  }

  /**
   * 获取即将到期的Job列表
   * GET /jobs/expiring?days=7
   */
  @Get('expiring')
  @ApiOperation({
    summary: '获取即将到期的任务',
    description: '获取即将到期的任务列表',
  })
  @ApiQuery({ name: 'days', required: false, description: '天数', example: 7 })
  @ApiResponse({ status: 200, description: '获取成功', type: [Object] })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ErrorResponseDto,
  })
  async findExpiringJobs(@Query('days') days?: string): Promise<Job[]> {
    const daysNumber = days ? parseInt(days, 10) : 7;
    return this.jobService.findExpiringJobs(daysNumber);
  }

  /**
   * 获取Job分类统计
   * GET /jobs/stats/category
   */
  @Get('stats/category')
  @ApiOperation({
    summary: '获取任务分类统计',
    description: '获取各分类的任务数量统计',
  })
  @ApiResponse({ status: 200, description: '获取成功', type: [Object] })
  async getJobStatsByCategory(): Promise<any[]> {
    return this.jobService.getJobStatsByCategory();
  }

  /**
   * 根据钱包地址获取Job列表
   * GET /jobs/wallet/:walletAddress
   */
  @Get('wallet/:walletAddress')
  @ApiOperation({
    summary: '根据钱包地址获取任务',
    description: '通过钱包地址查找相关任务',
  })
  @ApiParam({ name: 'walletAddress', description: '钱包地址' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Object] })
  async findByWalletAddress(
    @Param('walletAddress') walletAddress: string,
  ): Promise<Job[]> {
    return this.jobService.findByWalletAddress(walletAddress);
  }

  /**
   * 根据ID获取单个Job
   * GET /jobs/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取任务',
    description: '通过ID获取单个任务的详细信息',
  })
  @ApiParam({ name: 'id', description: '任务 ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: Object })
  @ApiResponse({
    status: 404,
    description: '任务不存在',
    type: ErrorResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<Job> {
    return this.jobService.findOne(id);
  }

  /**
   * 更新Job
   * PATCH /jobs/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新任务', description: '更新任务的信息' })
  @ApiParam({ name: 'id', description: '任务 ID' })
  @ApiBody({ type: UpdateJobDto })
  @ApiResponse({ status: 200, description: '更新成功', type: Object })
  @ApiResponse({
    status: 404,
    description: '任务不存在',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ): Promise<Job> {
    return this.jobService.update(id, updateJobDto);
  }

  /**
   * 更新Job状态
   * PATCH /jobs/:id/status
   */
  @Patch(':id/status')
  @ApiOperation({ summary: '更新任务状态', description: '更新任务的状态' })
  @ApiParam({ name: 'id', description: '任务 ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: Object.values(JobStatus) },
      },
    },
  })
  @ApiResponse({ status: 200, description: '状态更新成功', type: Object })
  @ApiResponse({
    status: 404,
    description: '任务不存在',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ErrorResponseDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: JobStatus,
  ): Promise<Job> {
    return this.jobService.updateStatus(id, status);
  }

  /**
   * 删除Job
   * DELETE /jobs/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除任务', description: '删除指定的任务' })
  @ApiParam({ name: 'id', description: '任务 ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({
    status: 404,
    description: '任务不存在',
    type: ErrorResponseDto,
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.jobService.remove(id);
  }
}
