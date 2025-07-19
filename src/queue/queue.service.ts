import { Injectable, Logger } from '@nestjs/common';

export interface SQSMessage {
  MessageId: string;
  Body: string;
  ReceiptHandle: string;
  Attributes?: Record<string, string>;
  MessageAttributes?: Record<string, any>;
  MD5OfBody?: string;
  SentTimestamp?: number;
  ApproximateReceiveCount?: number;
}

interface Queue {
  name: string;
  url: string;
  messages: SQSMessage[];
  attributes: Record<string, any>;
  createdAt: Date;
}

/**
 * 本地SQS模拟器 - 用于开发和测试
 * 模拟AWS SQS的基本功能，无需真实的AWS服务
 */
@Injectable()
export class LocalSQSService {
  private readonly logger = new Logger(LocalSQSService.name);
  private queues = new Map<string, Queue>();
  private messageIdCounter = 1;
  private receiptHandleCounter = 1;

  /**
   * 创建队列
   */
  createQueue(queueName: string, attributes: Record<string, any> = {}): string {
    const queueUrl = `http://localhost:9324/queue/${queueName}`;

    if (this.queues.has(queueName)) {
      return queueUrl;
    }

    const queue: Queue = {
      name: queueName,
      url: queueUrl,
      messages: [],
      attributes: {
        VisibilityTimeout: '30',
        MessageRetentionPeriod: '1209600',
        DelaySeconds: '0',
        MaximumMessageSize: '262144',
        ...attributes,
      },
      createdAt: new Date(),
    };

    this.queues.set(queueName, queue);
    this.logger.log(`队列已创建: ${queueName}`);

    return queueUrl;
  }

  /**
   * 获取队列URL
   */
  getQueueUrl(queueName: string): string | null {
    const queue = this.queues.get(queueName);
    return queue ? queue.url : null;
  }

  /**
   * 列出所有队列
   */
  listQueues(queueNamePrefix?: string): string[] {
    const queueUrls: string[] = [];

    for (const queue of this.queues.values()) {
      if (!queueNamePrefix || queue.name.startsWith(queueNamePrefix)) {
        queueUrls.push(queue.url);
      }
    }

    return queueUrls;
  }

  /**
   * 发送消息到队列
   */
  sendMessage(params: {
    QueueUrl: string;
    MessageBody: string;
    DelaySeconds?: number;
    MessageAttributes?: Record<string, any>;
    MessageDeduplicationId?: string;
    MessageGroupId?: string;
  }): { MessageId: string; MD5OfBody: string } {
    const queueName = this.extractQueueNameFromUrl(params.QueueUrl);
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`队列不存在: ${queueName}`);
    }

    const messageId = `msg-${this.messageIdCounter++}`;
    const receiptHandle = `rh-${this.receiptHandleCounter++}`;
    const md5OfBody = this.calculateMD5(params.MessageBody);

    const message: SQSMessage = {
      MessageId: messageId,
      Body: params.MessageBody,
      ReceiptHandle: receiptHandle,
      MD5OfBody: md5OfBody,
      SentTimestamp: Date.now(),
      ApproximateReceiveCount: 0,
      MessageAttributes: params.MessageAttributes,
    };

    // 模拟延迟发送
    const delaySeconds = params.DelaySeconds || 0;
    if (delaySeconds > 0) {
      setTimeout(() => {
        queue.messages.push(message);
        this.logger.log(
          `延迟消息已发送到队列: ${queueName}, MessageId: ${messageId}`,
        );
      }, delaySeconds * 1000);
    } else {
      queue.messages.push(message);
      this.logger.log(
        `消息已发送到队列: ${queueName}, MessageId: ${messageId}`,
      );
    }

    return {
      MessageId: messageId,
      MD5OfBody: md5OfBody,
    };
  }

  /**
   * 从队列接收消息
   */
  receiveMessage(params: {
    QueueUrl: string;
    MaxNumberOfMessages?: number;
    VisibilityTimeout?: number;
    WaitTimeSeconds?: number;
    AttributeNames?: string[];
    MessageAttributeNames?: string[];
  }): { Messages?: SQSMessage[] } {
    const queueName = this.extractQueueNameFromUrl(params.QueueUrl);
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`队列不存在: ${queueName}`);
    }

    const maxMessages = params.MaxNumberOfMessages || 1;
    const messages = queue.messages.splice(0, maxMessages);

    // 更新接收计数
    messages.forEach((msg) => {
      msg.ApproximateReceiveCount = (msg.ApproximateReceiveCount || 0) + 1;
    });

    if (messages.length > 0) {
      this.logger.log(`从队列接收到 ${messages.length} 条消息: ${queueName}`);
    }

    return messages.length > 0 ? { Messages: messages } : {};
  }

  /**
   * 删除消息
   */
  deleteMessage(params: { QueueUrl: string; ReceiptHandle: string }): void {
    const queueName = this.extractQueueNameFromUrl(params.QueueUrl);

    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`队列不存在: ${queueName}`);
    }
    queue.messages = queue.messages.filter((msg) => {
      if (msg.ReceiptHandle === params.ReceiptHandle) {
        this.logger.log(
          `消息已删除: ${queueName}, ReceiptHandle: ${params.ReceiptHandle}`,
        );
        return false;
      }
      return true;
    });
  }

  /**
   * 批量发送消息
   */
  sendMessageBatch(params: {
    QueueUrl: string;
    Entries: Array<{
      Id: string;
      MessageBody: string;
      DelaySeconds?: number;
      MessageAttributes?: Record<string, any>;
    }>;
  }): {
    Successful: Array<{ Id: string; MessageId: string; MD5OfBody: string }>;
  } {
    const successful: Array<{
      Id: string;
      MessageId: string;
      MD5OfBody: string;
    }> = [];

    for (const entry of params.Entries) {
      try {
        const result = this.sendMessage({
          QueueUrl: params.QueueUrl,
          MessageBody: entry.MessageBody,
          DelaySeconds: entry.DelaySeconds,
          MessageAttributes: entry.MessageAttributes,
        });

        successful.push({
          Id: entry.Id,
          MessageId: result.MessageId,
          MD5OfBody: result.MD5OfBody,
        });
      } catch (error) {
        this.logger.error(`批量发送消息失败: ${entry.Id}`, error);
      }
    }

    return { Successful: successful };
  }

  /**
   * 获取队列属性
   */
  getQueueAttributes(params: { QueueUrl: string; AttributeNames?: string[] }): {
    Attributes: Record<string, string>;
  } {
    const queueName = this.extractQueueNameFromUrl(params.QueueUrl);
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`队列不存在: ${queueName}`);
    }

    const attributes = {
      ...queue.attributes,
      ApproximateNumberOfMessages: queue.messages.length.toString(),
      CreatedTimestamp: Math.floor(queue.createdAt.getTime() / 1000).toString(),
    };

    return { Attributes: attributes };
  }

  /**
   * 删除队列
   */
  deleteQueue(queueUrl: string): void {
    const queueName = this.extractQueueNameFromUrl(queueUrl);

    if (this.queues.delete(queueName)) {
      this.logger.log(`队列已删除: ${queueName}`);
    } else {
      throw new Error(`队列不存在: ${queueName}`);
    }
  }

  /**
   * 清空队列中的所有消息
   */
  purgeQueue(queueUrl: string): void {
    const queueName = this.extractQueueNameFromUrl(queueUrl);
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`队列不存在: ${queueName}`);
    }

    const messageCount = queue.messages.length;
    queue.messages = [];
    this.logger.log(`队列已清空: ${queueName}, 删除了 ${messageCount} 条消息`);
  }

  /**
   * 获取队列统计信息
   */
  getQueueStats(queueName?: string): Record<string, any> | null {
    if (queueName) {
      const queue = this.queues.get(queueName);
      return queue
        ? {
            name: queue.name,
            messageCount: queue.messages.length,
            createdAt: queue.createdAt,
            attributes: queue.attributes,
          }
        : null;
    }

    const stats = {};
    for (const [name, queue] of this.queues) {
      stats[name] = {
        messageCount: queue.messages.length,
        createdAt: queue.createdAt,
      };
    }
    return stats;
  }

  /**
   * 从队列URL提取队列名称
   */
  private extractQueueNameFromUrl(queueUrl: string): string {
    const parts = queueUrl.split('/');
    return parts[parts.length - 1];
  }

  /**
   * 计算MD5哈希（简化版本）
   */
  private calculateMD5(data: string): string {
    // 这里使用简化的哈希计算，实际项目中应使用crypto模块
    return Buffer.from(data).toString('base64').substring(0, 32);
  }
}
