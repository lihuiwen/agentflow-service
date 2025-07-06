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
import { AgentService } from './agent.service';
import {
  CreateAgentDto,
  UpdateAgentDto,
  PaginationDto,
  PaginatedAgentsDto,
  AgentFilterDto,
} from './agent.dto';
import { Agent } from '@prisma/client';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('agents')
@Controller('agents')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * 创建新Agent
   * POST /agents
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建新Agent', description: '创建一个新的AI代理' })
  @ApiBody({ type: CreateAgentDto })
  @ApiResponse({ status: 201, description: '创建成功', type: Object })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ErrorResponseDto,
  })
  async create(@Body() createAgentDto: CreateAgentDto): Promise<Agent> {
    return this.agentService.create(createAgentDto);
  }

  /**
   * 获取所有Agent（支持分页和过滤）
   * GET /agents?page=1&limit=10&isActive=true&agentClassification=AI
   */
  @Get()
  @ApiOperation({
    summary: '获取Agent列表',
    description: '获取所有Agent，支持分页和过滤',
  })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({
    name: 'agentClassification',
    required: false,
    description: 'Agent分类',
  })
  @ApiQuery({ name: 'isActive', required: false, description: '是否激活' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Object] })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ErrorResponseDto,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: AgentFilterDto,
  ): Promise<Agent[] | PaginatedAgentsDto> {
    // 如果提供了分页参数，返回分页结果
    if (paginationDto.page || paginationDto.limit) {
      return this.agentService.findAllPaginated(paginationDto, filterDto);
    }

    // 否则返回所有数据
    return this.agentService.findAll(filterDto);
  }

  /**
   * 获取活跃的Agent列表
   * GET /agents/active
   */
  @Get('active')
  @ApiOperation({
    summary: '获取活跃Agent列表',
    description: '获取所有处于活跃状态的Agent',
  })
  @ApiResponse({ status: 200, description: '获取成功', type: [Object] })
  async findActiveAgents(): Promise<Agent[]> {
    return this.agentService.findActiveAgents();
  }

  /**
   * 根据钱包地址获取Agent
   * GET /agents/wallet/:walletAddress
   */
  @Get('wallet/:walletAddress')
  @ApiOperation({
    summary: '根据钱包地址获取Agent',
    description: '通过钱包地址查找Agent',
  })
  @ApiParam({ name: 'walletAddress', description: '钱包地址' })
  @ApiResponse({ status: 200, description: '获取成功', type: Object })
  @ApiResponse({
    status: 404,
    description: 'Agent不存在',
    type: ErrorResponseDto,
  })
  async findByWalletAddress(
    @Param('walletAddress') walletAddress: string,
  ): Promise<Agent | null> {
    return this.agentService.findByWalletAddress(walletAddress);
  }

  /**
   * 根据ID获取单个Agent
   * GET /agents/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: '根据ID获取Agent',
    description: '通过ID获取单个Agent的详细信息',
  })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiResponse({ status: 200, description: '获取成功', type: Object })
  @ApiResponse({
    status: 404,
    description: 'Agent不存在',
    type: ErrorResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<Agent> {
    return this.agentService.findOne(id);
  }

  /**
   * 更新Agent
   * PATCH /agents/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: '更新Agent', description: '更新Agent的信息' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiBody({ type: UpdateAgentDto })
  @ApiResponse({ status: 200, description: '更新成功', type: Object })
  @ApiResponse({
    status: 404,
    description: 'Agent不存在',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '请求参数错误',
    type: ErrorResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
  ): Promise<Agent> {
    return this.agentService.update(id, updateAgentDto);
  }

  /**
   * 激活/停用Agent
   * PATCH /agents/:id/toggle-active
   */
  @Patch(':id/toggle-active')
  @ApiOperation({ summary: '切换Agent状态', description: '激活或停用Agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiResponse({ status: 200, description: '状态切换成功', type: Object })
  @ApiResponse({
    status: 404,
    description: 'Agent不存在',
    type: ErrorResponseDto,
  })
  async toggleActive(@Param('id') id: string): Promise<Agent> {
    return this.agentService.toggleActive(id);
  }

  /**
   * 删除Agent
   * DELETE /agents/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除Agent', description: '删除指定的Agent' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({
    status: 404,
    description: 'Agent不存在',
    type: ErrorResponseDto,
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.agentService.remove(id);
  }
}
