import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createCategoryDto = { title: 'Test Category' };
      const expectedResult = { id: '1', title: 'Test Category' };

      mockPrismaService.category.create.mockResolvedValue(expectedResult);

      const result = await service.create(createCategoryDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: createCategoryDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const expectedResult = [
        { id: '1', title: 'Category 1' },
        { id: '2', title: 'Category 2' },
      ];

      mockPrismaService.category.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        orderBy: { title: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a category if found', async () => {
      const expectedResult = { id: '1', title: 'Test Category' };

      mockPrismaService.category.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne('1');

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated categories', async () => {
      const mockCategories = [
        { id: '1', title: 'Category 1' },
        { id: '2', title: 'Category 2' },
      ];
      const mockTotal = 20;
      const paginationDto = { page: 1, limit: 10 };

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);
      mockPrismaService.category.count.mockResolvedValue(mockTotal);

      const result = await service.findAllPaginated(paginationDto);

      expect(result).toEqual({
        data: mockCategories,
        total: mockTotal,
        page: 1,
        limit: 10,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      });

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { title: 'asc' },
      });
      expect(mockPrismaService.category.count).toHaveBeenCalled();
    });

    it('should handle last page correctly', async () => {
      const mockCategories = [{ id: '1', title: 'Category 1' }];
      const mockTotal = 11;
      const paginationDto = { page: 2, limit: 10 };

      mockPrismaService.category.findMany.mockResolvedValue(mockCategories);
      mockPrismaService.category.count.mockResolvedValue(mockTotal);

      const result = await service.findAllPaginated(paginationDto);

      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(true);
      expect(result.totalPages).toBe(2);
    });
  });
});
