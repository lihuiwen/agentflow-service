import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateJobDto,
  UpdateJobDto,
  PaginationDto,
  PaginatedJobsDto,
  JobFilterDto,
} from './job.dto';
import { Job, JobStatus } from '@prisma/client';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建新Job
   */
  async create(createJobDto: CreateJobDto): Promise<Job> {
    return this.prisma.job.create({
      data: {
        ...createJobDto,
        deadline: new Date(createJobDto.deadline),
      },
    });
  }

  /**
   * 获取所有Job（不分页）
   */
  async findAll(filterDto?: JobFilterDto): Promise<Job[]> {
    const where = this.buildWhereClause(filterDto);

    return this.prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' }, // 按创建时间降序排列
    });
  }

  /**
   * 获取Job（分页）
   */
  async findAllPaginated(
    paginationDto: PaginationDto,
    filterDto?: JobFilterDto,
  ): Promise<PaginatedJobsDto> {
    const { page = 1, limit = 10 } = paginationDto;
    const where = this.buildWhereClause(filterDto);

    // 计算跳过的记录数
    const skip = (page - 1) * limit;

    // 并行查询数据和总数
    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.job.count({ where }),
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: jobs,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  /**
   * 根据ID获取单个Job
   */
  async findOne(id: string): Promise<Job> {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        distributionRecord: {
          include: {
            assignedAgents: {
              include: {
                agent: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundException(`Job ID ${id} 不存在`);
    }

    return job;
  }

  /**
   * 根据钱包地址获取Job列表
   */
  async findByWalletAddress(walletAddress: string): Promise<Job[]> {
    return this.prisma.job.findMany({
      where: { walletAddress },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 更新Job
   */
  async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    // 先检查Job是否存在
    await this.findOne(id);

    const updateData = { ...updateJobDto };

    // 如果有deadline字段，转换为Date类型
    if (updateJobDto.deadline) {
      updateData.deadline = new Date(updateJobDto.deadline);
    }

    // 处理JobDistributionRecord的更新
    const { assignedAgentId, assignedAgentName, ...jobUpdateData } = updateData;
    
    return this.prisma.$transaction(async (prisma) => {
      // 更新Job基本信息
      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          ...jobUpdateData,
          updatedAt: new Date(),
        },
      });

      // 如果需要更新JobDistributionRecord的assignedAgent信息
      if (assignedAgentId !== undefined || assignedAgentName !== undefined) {
        // 检查是否存在JobDistributionRecord
        const existingDistribution = await prisma.jobDistributionRecord.findUnique({
          where: { jobId: id },
        });

        if (existingDistribution) {
          // 更新现有的JobDistributionRecord
          await prisma.jobDistributionRecord.update({
            where: { jobId: id },
            data: {
              ...(assignedAgentId !== undefined && { assignedAgentId }),
              ...(assignedAgentName !== undefined && { assignedAgentName }),
            },
          });
        }
      }

      return updatedJob;
    });
  }

  /**
   * 删除Job
   */
  async remove(id: string): Promise<Job> {
    // 先检查Job是否存在
    await this.findOne(id);

    return this.prisma.job.delete({
      where: { id },
    });
  }

  /**
   * 更新Job状态
   */
  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    // 先检查Job是否存在
    await this.findOne(id);

    return this.prisma.job.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 获取开放状态的Job列表
   */
  async findOpenJobs(): Promise<Job[]> {
    return this.prisma.job.findMany({
      where: {
        status: JobStatus.OPEN,
        isPublic: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取即将到期的Job列表
   */
  async findExpiringJobs(days: number = 7): Promise<Job[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return this.prisma.job.findMany({
      where: {
        deadline: {
          lte: expiryDate,
        },
        status: {
          in: [JobStatus.OPEN, JobStatus.DISTRIBUTED, JobStatus.IN_PROGRESS],
        },
      },
      orderBy: { deadline: 'asc' },
    });
  }

  /**
   * 根据分类获取Job统计
   */
  async getJobStatsByCategory(): Promise<any[]> {
    const stats = await this.prisma.job.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    return stats.map((stat) => ({
      category: stat.category,
      count: stat._count.id,
    }));
  }

  /**
   * 构建查询条件
   */
  private buildWhereClause(filterDto?: JobFilterDto): Record<string, unknown> {
    if (!filterDto) return {};

    const where: Record<string, unknown> = {};

    if (filterDto.category) {
      where.category = filterDto.category;
    }

    if (filterDto.status) {
      where.status = filterDto.status;
    }

    if (filterDto.priority) {
      where.priority = filterDto.priority;
    }

    if (filterDto.skillLevel) {
      where.skillLevel = filterDto.skillLevel;
    }

    if (filterDto.tags && filterDto.tags.length > 0) {
      where.tags = {
        hasEvery: filterDto.tags, // 包含所有指定标签
      };
    }

    if (filterDto.isPublic !== undefined) {
      where.isPublic = filterDto.isPublic;
    }

    if (filterDto.walletAddress) {
      where.walletAddress = filterDto.walletAddress;
    }

    // 预算范围过滤
    if (
      filterDto.minBudget !== undefined ||
      filterDto.maxBudget !== undefined
    ) {
      const budgetFilter: Record<string, number> = {};

      if (filterDto.minBudget !== undefined) {
        budgetFilter.gte = filterDto.minBudget;
      }

      if (filterDto.maxBudget !== undefined) {
        budgetFilter.lte = filterDto.maxBudget;
      }

      where.maxBudget = budgetFilter;
    }

    return where;
  }
}
