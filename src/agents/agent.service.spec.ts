import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AgentService', () => {
  let service: AgentService;

  const mockAgent = {
    id: 'test-id',
    agentName: 'Test Agent',
    agentAddress: 'http://test.com',
    description: 'Test Description',
    authorBio: 'Test Author',
    agentClassification: 'AI',
    tags: ['test', 'agent'],
    isPrivate: false,
    autoAcceptJobs: true,
    contractType: 'result',
    isActive: true,
    reputation: 4.5,
    successRate: 0.95,
    totalJobsCompleted: 10,
    walletAddress: '0x123...',
    createdAt: new Date(),
    updatedAt: new Date(),
    jobDistributions: [],
  };

  const mockPrismaService = {
    agent: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new agent', async () => {
      const createDto = {
        agentName: 'Test Agent',
        agentAddress: 'http://test.com',
        description: 'Test Description',
        authorBio: 'Test Author',
        agentClassification: 'AI',
        tags: ['test'],
        walletAddress: '0x123...',
      };

      mockPrismaService.agent.create.mockResolvedValue(mockAgent);

      const result = await service.create(createDto);

      expect(result).toEqual(mockAgent);
      expect(mockPrismaService.agent.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findOne', () => {
    it('should return an agent by id', async () => {
      mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);

      const result = await service.findOne('test-id');

      expect(result).toEqual(mockAgent);
      expect(mockPrismaService.agent.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
    });

    it('should throw NotFoundException if agent not found', async () => {
      mockPrismaService.agent.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findActiveAgents', () => {
    it('should return active agents', async () => {
      const activeAgents = [mockAgent];
      mockPrismaService.agent.findMany.mockResolvedValue(activeAgents);

      const result = await service.findActiveAgents();

      expect(result).toEqual(activeAgents);
      expect(mockPrismaService.agent.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { reputation: 'desc' },
      });
    });
  });

  describe('toggleActive', () => {
    it('should toggle agent active status', async () => {
      const updatedAgent = { ...mockAgent, isActive: false };

      mockPrismaService.agent.findUnique.mockResolvedValue(mockAgent);
      mockPrismaService.agent.update.mockResolvedValue(updatedAgent);

      const result = await service.toggleActive('test-id');

      expect(result).toEqual(updatedAgent);
      expect(mockPrismaService.agent.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          isActive: false,
          updatedAt: expect.any(Date) as Date,
        },
      });
    });
  });
});
