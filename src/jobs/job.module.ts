import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // 导入Prisma模块以使用数据库服务
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService], // 导出服务以供其他模块使用
})
export class JobModule {}
