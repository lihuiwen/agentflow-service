import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // 导入Prisma模块以使用数据库服务
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService], // 导出服务以供其他模块使用
})
export class AgentModule {}
