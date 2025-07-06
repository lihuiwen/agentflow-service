import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAgentDto,
  UpdateAgentDto,
  PaginationDto,
  PaginatedAgentsDto,
  AgentFilterDto,
} from './agent.dto';
import { Agent } from '@prisma/client';

@Injectable()
export class AgentService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建新Agent
   */
  async create(createAgentDto: CreateAgentDto): Promise<Agent> {
    return this.prisma.agent.create({
      data: createAgentDto,
    });
  }

  /**
   * 获取所有Agent（不分页）
   */
  async findAll(filterDto?: AgentFilterDto): Promise<Agent[]> {
    const where = this.buildWhereClause(filterDto);

    return this.prisma.agent.findMany({
      where,
      orderBy: { createdAt: 'desc' }, // 按创建时间降序排列
    });
  }

  /**
   * 获取Agent（分页）
   */
  async findAllPaginated(
    paginationDto: PaginationDto,
    filterDto?: AgentFilterDto,
  ): Promise<PaginatedAgentsDto> {
    const { page = 1, limit = 10 } = paginationDto;
    const where = this.buildWhereClause(filterDto);

    // 计算跳过的记录数
    const skip = (page - 1) * limit;

    // 并行查询数据和总数
    const [agents, total] = await Promise.all([
      this.prisma.agent.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agent.count({ where }),
    ]);

    // 计算分页信息
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: agents,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  /**
   * 根据ID获取单个Agent
   */
  async findOne(id: string): Promise<Agent> {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      throw new NotFoundException(`Agent ID ${id} 不存在`);
    }

    return agent;
  }

  /**
   * 根据钱包地址获取Agent
   */
  async findByWalletAddress(walletAddress: string): Promise<Agent | null> {
    return this.prisma.agent.findFirst({
      where: { walletAddress },
    });
  }

  /**
   * 更新Agent
   */
  async update(id: string, updateAgentDto: UpdateAgentDto): Promise<Agent> {
    // 先检查Agent是否存在
    await this.findOne(id);

    return this.prisma.agent.update({
      where: { id },
      data: {
        ...updateAgentDto,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 删除Agent
   */
  async remove(id: string): Promise<Agent> {
    // 先检查Agent是否存在
    await this.findOne(id);

    return this.prisma.agent.delete({
      where: { id },
    });
  }

  /**
   * 激活/停用Agent
   */
  async toggleActive(id: string): Promise<Agent> {
    const agent = await this.findOne(id);

    return this.prisma.agent.update({
      where: { id },
      data: {
        isActive: !agent.isActive,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * 获取活跃的Agent列表
   */
  async findActiveAgents(): Promise<Agent[]> {
    return this.prisma.agent.findMany({
      where: { isActive: true },
      orderBy: { reputation: 'desc' }, // 按信誉度降序排列
    });
  }

  /**
   * 构建查询条件
   */
  private buildWhereClause(
    filterDto?: AgentFilterDto,
  ): Record<string, unknown> {
    if (!filterDto) return {};

    const where: Record<string, unknown> = {};

    if (filterDto.agentClassification) {
      where.agentClassification = filterDto.agentClassification;
    }

    if (filterDto.tags && filterDto.tags.length > 0) {
      where.tags = {
        hasEvery: filterDto.tags, // 包含所有指定标签
      };
    }

    if (filterDto.isActive !== undefined) {
      where.isActive = filterDto.isActive;
    }

    if (filterDto.isPrivate !== undefined) {
      where.isPrivate = filterDto.isPrivate;
    }

    if (filterDto.minReputation !== undefined) {
      where.reputation = {
        gte: filterDto.minReputation,
      };
    }

    return where;
  }
}
