import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { AgentModule } from './agents/agent.module';
import { JobModule } from './jobs/job.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [PrismaModule, CategoryModule, AgentModule, JobModule, QueueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
