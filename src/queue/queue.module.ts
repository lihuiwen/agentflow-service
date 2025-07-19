import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { LocalSQSService } from './queue.service';
import { GlobalQueueManager } from './global-queue.manager';

/**
 * 队列模块 - 本地SQS模拟器
 */
@Module({
  controllers: [QueueController],
  providers: [LocalSQSService, GlobalQueueManager],
  exports: [LocalSQSService, GlobalQueueManager], // 导出服务供其他模块使用
})
export class QueueModule {}
