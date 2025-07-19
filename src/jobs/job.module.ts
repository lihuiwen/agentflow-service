import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [PrismaModule, QueueModule], // 导入Prisma和Queue模块
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService], // 导出服务以供其他模块使用
})
export class JobModule {}
