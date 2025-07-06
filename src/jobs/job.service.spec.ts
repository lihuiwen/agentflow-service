import { Test, TestingModule } from '@nestjs/testing';
import { JobService } from './job.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { JobStatus } from '@prisma/client';

describe('JobService', () => {
  let service: JobService;

  const mockJob = {
    id: 'test-job-id',
    jobTitle: 'Test Job',
    category: 'AI',
    description: 'Test Description',
    deliverables: 'Test Deliverables',
    budget: { min: 100, max: 500 },
    maxBudget: 500,
    deadline: new Date('2024-12-31'),
    paymentType: 'fixed',
    priority: 'high',
    skillLevel: 'intermediate',
    tags: ['test', 'job'],
    status: JobStatus.OPEN,
    autoAssign: false,
    allowBidding: true,
    allowParallelExecution: false,
    escrowEnabled: true,
    isPublic: true,
    walletAddress: '0x123...',
    createdAt: new Date(),
    updatedAt: new Date(),
    distributionRecord: null,
  };

  const mockPrismaService = {
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new job', async () => {
      const createDto = {
        jobTitle: 'Test Job',
        category: 'AI',
        description: 'Test Description',
        deliverables: 'Test Deliverables',
        budget: { min: 100, max: 500 },
        deadline: new Date('2024-12-31'),
        paymentType: 'fixed',
        priority: 'high',
        skillLevel: 'intermediate',
        tags: ['test'],
        walletAddress: '0x123...',
      };

      mockPrismaService.job.create.mockResolvedValue(mockJob);

      const result = await service.create(createDto);

      expect(result).toEqual(mockJob);
      expect(mockPrismaService.job.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          deadline: new Date(createDto.deadline),
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);

      const result = await service.findOne('test-job-id');

      expect(result).toEqual(mockJob);
      expect(mockPrismaService.job.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-job-id' },
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
    });

    it('should throw NotFoundException if job not found', async () => {
      mockPrismaService.job.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOpenJobs', () => {
    it('should return open jobs', async () => {
      const openJobs = [mockJob];
      mockPrismaService.job.findMany.mockResolvedValue(openJobs);

      const result = await service.findOpenJobs();

      expect(result).toEqual(openJobs);
      expect(mockPrismaService.job.findMany).toHaveBeenCalledWith({
        where: {
          status: JobStatus.OPEN,
          isPublic: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update job status', async () => {
      const updatedJob = { ...mockJob, status: JobStatus.IN_PROGRESS };

      mockPrismaService.job.findUnique.mockResolvedValue(mockJob);
      mockPrismaService.job.update.mockResolvedValue(updatedJob);

      const result = await service.updateStatus(
        'test-job-id',
        JobStatus.IN_PROGRESS,
      );

      expect(result).toEqual(updatedJob);
      expect(mockPrismaService.job.update).toHaveBeenCalledWith({
        where: { id: 'test-job-id' },
        data: {
          status: JobStatus.IN_PROGRESS,
          updatedAt: expect.any(Date) as Date,
        },
      });
    });
  });

  describe('getJobStatsByCategory', () => {
    it('should return job stats by category', async () => {
      const mockStats = [
        { category: 'AI', _count: { id: 5 } },
        { category: 'Web', _count: { id: 3 } },
      ];

      mockPrismaService.job.groupBy.mockResolvedValue(mockStats);

      const result = await service.getJobStatsByCategory();

      expect(result).toEqual([
        { category: 'AI', count: 5 },
        { category: 'Web', count: 3 },
      ]);
    });
  });
});
