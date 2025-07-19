import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LocalSQSService } from './queue.service';
import { GlobalQueueManager } from './global-queue.manager';

/**
 * 本地SQS模拟器控制器
 * 提供REST API接口来操作队列和消息
 */
@ApiTags('Local SQS Simulator')
@Controller('sqs')
export class QueueController {
  constructor(
    private readonly sqsService: LocalSQSService,
    private readonly queueManager: GlobalQueueManager,
  ) {}

  /**
   * 创建队列
   */
  @Post('queue')
  @ApiOperation({ summary: '创建队列' })
  @ApiResponse({ status: 201, description: '队列创建成功' })
  createQueue(
    @Body() body: { queueName: string; attributes?: Record<string, any> },
  ) {
    const queueUrl = this.sqsService.createQueue(
      body.queueName,
      body.attributes,
    );
    return { queueUrl, message: '队列创建成功' };
  }

  /**
   * 获取队列URL
   */
  @Get('queue/:queueName/url')
  @ApiOperation({ summary: '获取队列URL' })
  @ApiResponse({ status: 200, description: '成功获取队列URL' })
  getQueueUrl(@Param('queueName') queueName: string) {
    const queueUrl = this.sqsService.getQueueUrl(queueName);
    if (!queueUrl) {
      return { error: '队列不存在' };
    }
    return { queueUrl };
  }

  /**
   * 列出所有队列
   */
  @Get('queues')
  @ApiOperation({ summary: '列出所有队列' })
  @ApiResponse({ status: 200, description: '成功获取队列列表' })
  listQueues(@Query('prefix') prefix?: string) {
    const queueUrls = this.sqsService.listQueues(prefix);
    return { queueUrls, count: queueUrls.length };
  }

  /**
   * 发送消息到队列
   */
  @Post('message')
  @ApiOperation({ summary: '发送消息到队列' })
  @ApiResponse({ status: 201, description: '消息发送成功' })
  sendMessage(
    @Body()
    body: {
      queueUrl: string;
      messageBody: string;
      delaySeconds?: number;
      messageAttributes?: Record<string, any>;
    },
  ) {
    const result = this.sqsService.sendMessage({
      QueueUrl: body.queueUrl,
      MessageBody: body.messageBody,
      DelaySeconds: body.delaySeconds,
      MessageAttributes: body.messageAttributes,
    });

    return {
      ...result,
      message: '消息发送成功',
    };
  }

  /**
   * 批量发送消息
   */
  @Post('messages/batch')
  @ApiOperation({ summary: '批量发送消息' })
  @ApiResponse({ status: 201, description: '批量消息发送成功' })
  sendMessageBatch(
    @Body()
    body: {
      queueUrl: string;
      entries: Array<{
        id: string;
        messageBody: string;
        delaySeconds?: number;
        messageAttributes?: Record<string, any>;
      }>;
    },
  ) {
    const result = this.sqsService.sendMessageBatch({
      QueueUrl: body.queueUrl,
      Entries: body.entries.map((entry) => ({
        Id: entry.id,
        MessageBody: entry.messageBody,
        DelaySeconds: entry.delaySeconds,
        MessageAttributes: entry.messageAttributes,
      })),
    });

    return {
      ...result,
      message: '批量消息发送成功',
    };
  }

  /**
   * 从队列接收消息
   */
  @Post('message/receive')
  @ApiOperation({ summary: '从队列接收消息' })
  @ApiResponse({ status: 200, description: '成功接收消息' })
  receiveMessage(
    @Body()
    body: {
      queueUrl: string;
      maxNumberOfMessages?: number;
      visibilityTimeout?: number;
      waitTimeSeconds?: number;
    },
  ) {
    const result = this.sqsService.receiveMessage({
      QueueUrl: body.queueUrl,
      MaxNumberOfMessages: body.maxNumberOfMessages,
      VisibilityTimeout: body.visibilityTimeout,
      WaitTimeSeconds: body.waitTimeSeconds,
    });

    return {
      ...result,
      message: result.Messages
        ? `接收到 ${result.Messages.length} 条消息`
        : '没有可接收的消息',
    };
  }

  /**
   * 删除消息
   */
  @Delete('message')
  @ApiOperation({ summary: '删除消息' })
  @ApiResponse({ status: 200, description: '消息删除成功' })
  deleteMessage(@Body() body: { queueUrl: string; receiptHandle: string }) {
    this.sqsService.deleteMessage({
      QueueUrl: body.queueUrl,
      ReceiptHandle: body.receiptHandle,
    });

    return { message: '消息删除成功' };
  }

  /**
   * 获取队列属性
   */
  @Get('queue/:queueName/attributes')
  @ApiOperation({ summary: '获取队列属性' })
  @ApiResponse({ status: 200, description: '成功获取队列属性' })
  getQueueAttributes(
    @Param('queueName') queueName: string,
    @Query('attributeNames') attributeNames?: string,
  ) {
    const queueUrl = this.sqsService.getQueueUrl(queueName);
    if (!queueUrl) {
      return { error: '队列不存在' };
    }

    const attributes = attributeNames ? attributeNames.split(',') : undefined;
    const result = this.sqsService.getQueueAttributes({
      QueueUrl: queueUrl,
      AttributeNames: attributes,
    });

    return result;
  }

  /**
   * 删除队列
   */
  @Delete('queue/:queueName')
  @ApiOperation({ summary: '删除队列' })
  @ApiResponse({ status: 200, description: '队列删除成功' })
  deleteQueue(@Param('queueName') queueName: string) {
    const queueUrl = this.sqsService.getQueueUrl(queueName);
    if (!queueUrl) {
      return { error: '队列不存在' };
    }

    this.sqsService.deleteQueue(queueUrl);
    return { message: '队列删除成功' };
  }

  /**
   * 清空队列
   */
  @Post('queue/:queueName/purge')
  @ApiOperation({ summary: '清空队列中的所有消息' })
  @ApiResponse({ status: 200, description: '队列清空成功' })
  purgeQueue(@Param('queueName') queueName: string) {
    const queueUrl = this.sqsService.getQueueUrl(queueName);
    if (!queueUrl) {
      return { error: '队列不存在' };
    }

    this.sqsService.purgeQueue(queueUrl);
    return { message: '队列清空成功' };
  }

  /**
   * 获取队列统计信息
   */
  @Get('stats')
  @ApiOperation({ summary: '获取所有队列统计信息' })
  @ApiResponse({ status: 200, description: '成功获取统计信息' })
  getAllStats() {
    const stats = this.sqsService.getQueueStats();
    return { stats };
  }

  /**
   * 获取指定队列统计信息
   */
  @Get('queue/:queueName/stats')
  @ApiOperation({ summary: '获取指定队列统计信息' })
  @ApiResponse({ status: 200, description: '成功获取队列统计信息' })
  getQueueStats(@Param('queueName') queueName: string) {
    const stats = this.sqsService.getQueueStats(queueName);
    if (!stats) {
      return { error: '队列不存在' };
    }
    return { stats };
  }

  // === Job队列专用API ===

  /**
   * 发送消息到Job队列
   */
  @Post('job-queue/send')
  @ApiOperation({ summary: '发送消息到Job队列' })
  @ApiResponse({ status: 201, description: 'Job消息发送成功' })
  sendJobMessage(@Body() body: { messageBody: object; delaySeconds?: number }) {
    const result = this.queueManager.sendJobMessage(
      body.messageBody,
      body.delaySeconds,
    );
    return {
      ...result,
      message: 'Job消息发送成功',
    };
  }

  /**
   * 从Job队列接收消息
   */
  @Post('job-queue/receive')
  @ApiOperation({ summary: '从Job队列接收消息' })
  @ApiResponse({ status: 200, description: '成功接收Job消息' })
  receiveJobMessages(@Body() body: { maxMessages?: number }) {
    const result = this.queueManager.receiveJobMessages(body.maxMessages);
    return {
      ...result,
      message: result.Messages
        ? `接收到 ${result.Messages.length} 条Job消息`
        : '没有可接收的Job消息',
    };
  }

  /**
   * 删除Job队列中的消息
   */
  @Delete('job-queue/message')
  @ApiOperation({ summary: '删除Job队列中的消息' })
  @ApiResponse({ status: 200, description: 'Job消息删除成功' })
  deleteJobMessage(@Body() body: { receiptHandle: string }) {
    this.queueManager.deleteJobMessage(body.receiptHandle);
    return { message: 'Job消息删除成功' };
  }

  /**
   * 获取Job队列统计信息
   */
  @Get('job-queue/stats')
  @ApiOperation({ summary: '获取Job队列统计信息' })
  @ApiResponse({ status: 200, description: '成功获取Job队列统计信息' })
  getJobQueueStats() {
    const stats = this.queueManager.getJobQueueStats();
    return { stats };
  }

  /**
   * 获取Job队列URL
   */
  @Get('job-queue/url')
  @ApiOperation({ summary: '获取Job队列URL' })
  @ApiResponse({ status: 200, description: '成功获取Job队列URL' })
  getJobQueueUrl() {
    const queueUrl = this.queueManager.getJobQueueUrl();
    return { queueUrl };
  }
}
