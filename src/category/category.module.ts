import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // 导入Prisma模块以使用数据库服务
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService], // 导出服务以供其他模块使用
})
export class CategoryModule {}
