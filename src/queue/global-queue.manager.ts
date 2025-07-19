import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { LocalSQSService } from './queue.service';

/**
 * 全局队列管理器
 * 管理应用中的所有队列实例，提供统一的队列访问接口
 */
@Injectable()
export class GlobalQueueManager implements OnModuleInit {
  private readonly logger = new Logger(GlobalQueueManager.name);
  private static instance: GlobalQueueManager;

  private jobQueueUrl: string;
  private readonly JOB_QUEUE_NAME = 'job-queue';

  constructor(private readonly sqsService: LocalSQSService) {
    GlobalQueueManager.instance = this;
  }

  static getInstance(): GlobalQueueManager {
    return GlobalQueueManager.instance;
  }

  /**
   * 应用启动时初始化队列
   */
  onModuleInit() {
    this.initializeQueues();
  }

  /**
   * 初始化默认队列
   */
  private initializeQueues() {
    try {
      // 创建job队列
      this.jobQueueUrl = this.sqsService.createQueue(this.JOB_QUEUE_NAME, {
        // VisibilityTimeout: 消息在被接收后，其他消费者在此时间（秒）内无法再次接收该消息。此处设置为300秒（5分钟），
        // 适用于Job处理较长时间的场景，防止消息被重复消费。
        VisibilityTimeout: '300', // 5分钟

        // MessageRetentionPeriod: 队列中未被消费的消息最大保留时间（秒）。此处设置为1209600秒（14天），
        // 允许消息在队列中最长保留两周，便于故障恢复和消息追溯。
        MessageRetentionPeriod: '1209600', // 14天

        // DelaySeconds: 新消息默认延迟可见时间（秒）。此处设置为0，表示消息发送后立即可被消费。
        DelaySeconds: '0',
      });

      this.logger.log(`Job队列已初始化: ${this.jobQueueUrl}`);
    } catch (error) {
      this.logger.error('队列初始化失败:', error);
      throw error;
    }
  }

  /**
   * 获取job队列URL
   */
  getJobQueueUrl(): string {
    if (!this.jobQueueUrl) {
      throw new Error('Job队列未初始化');
    }
    return this.jobQueueUrl;
  }

  /**
   * 发送消息到job队列
   */
  sendJobMessage(messageBody: object, delaySeconds?: number) {
    const queueUrl = this.getJobQueueUrl();

    return this.sqsService.sendMessage({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(messageBody),
      DelaySeconds: delaySeconds,
      MessageAttributes: {
        timestamp: {
          DataType: 'String',
          StringValue: new Date().toISOString(),
        },
        source: {
          DataType: 'String',
          StringValue: 'agentflow-service',
        },
      },
    });
  }

  /**
   * 从job队列接收消息
   */
  receiveJobMessages(maxMessages: number = 1) {
    const queueUrl = this.getJobQueueUrl();

    return this.sqsService.receiveMessage({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxMessages,
      WaitTimeSeconds: 20, // 长轮询
      MessageAttributeNames: ['All'],
    });
  }

  /**
   * 删除job队列中的消息
   */
  deleteJobMessage(receiptHandle: string) {
    const queueUrl = this.getJobQueueUrl();

    return this.sqsService.deleteMessage({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    });
  }

  /**
   * 获取job队列统计信息
   */
  getJobQueueStats() {
    return this.sqsService.getQueueStats(this.JOB_QUEUE_NAME);
  }
}
