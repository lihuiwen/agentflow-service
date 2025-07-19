# AWS SQS 本地模拟器

这是一个简单的AWS SQS本地模拟器，用于开发和测试环境。它提供了与AWS SQS相似的功能，无需真实的AWS服务。

## 功能特性

- ✅ 创建和删除队列
- ✅ 发送消息（单条和批量）
- ✅ 接收和删除消息
- ✅ 队列属性管理
- ✅ 消息延迟发送
- ✅ 队列统计信息
- ✅ REST API接口
- ✅ AWS SDK兼容适配器

## 快速开始

### 1. 启动服务

```bash
npm run start:dev
```

服务将在 `http://localhost:3000` 启动，SQS模拟器API在 `/sqs` 路径下。

### 2. 通过REST API使用

#### 创建队列

```bash
curl -X POST http://localhost:3000/sqs/queue \
  -H "Content-Type: application/json" \
  -d '{"queueName": "test-queue", "attributes": {"VisibilityTimeout": "30"}}'
```

#### 发送消息

```bash
curl -X POST http://localhost:3000/sqs/message \
  -H "Content-Type: application/json" \
  -d '{
    "queueUrl": "http://localhost:9324/queue/test-queue",
    "messageBody": "{\"type\":\"test\",\"data\":\"hello world\"}",
    "delaySeconds": 0
  }'
```

#### 接收消息

```bash
curl -X POST http://localhost:3000/sqs/message/receive \
  -H "Content-Type: application/json" \
  -d '{
    "queueUrl": "http://localhost:9324/queue/test-queue",
    "maxNumberOfMessages": 5
  }'
```

#### 获取队列统计

```bash
curl http://localhost:3000/sqs/queue/test-queue/stats
```

### 3. 在代码中使用

#### 直接使用LocalSQSService

```typescript
import { LocalSQSService } from './queue/queue.service';

const sqsService = new LocalSQSService();

// 创建队列
const queueUrl = sqsService.createQueue('my-queue');

// 发送消息
const result = sqsService.sendMessage({
  QueueUrl: queueUrl,
  MessageBody: JSON.stringify({ action: 'process_order', orderId: '123' }),
});

// 接收消息
const messages = sqsService.receiveMessage({
  QueueUrl: queueUrl,
  MaxNumberOfMessages: 10,
});
```

#### 使用AWS SDK兼容适配器

```typescript
import { LocalSQSService } from './queue/queue.service';
import { SQSAdapter } from '../examples/aws-sdk-adapter';

const localSQS = new LocalSQSService();
const sqsAdapter = new SQSAdapter(localSQS);

// 使用方式与AWS SDK完全相同
const result = await sqsAdapter
  .sendMessage({
    QueueUrl: 'http://localhost:9324/queue/my-queue',
    MessageBody: 'Hello World',
  })
  .promise();
```

### 4. 环境切换

可以通过环境变量在本地模拟器和真实AWS SQS之间切换：

```typescript
import { createSQSClient } from '../examples/aws-sdk-adapter';

// 设置环境变量 USE_LOCAL_SQS=true 使用本地模拟器
// 否则使用真实AWS SQS
const sqs = createSQSClient(localSQSService);
```

## API接口

### 队列操作

| 方法   | 路径                          | 描述         |
| ------ | ----------------------------- | ------------ |
| POST   | `/sqs/queue`                  | 创建队列     |
| GET    | `/sqs/queues`                 | 列出所有队列 |
| GET    | `/sqs/queue/:name/url`        | 获取队列URL  |
| DELETE | `/sqs/queue/:name`            | 删除队列     |
| POST   | `/sqs/queue/:name/purge`      | 清空队列     |
| GET    | `/sqs/queue/:name/attributes` | 获取队列属性 |

### 消息操作

| 方法   | 路径                   | 描述         |
| ------ | ---------------------- | ------------ |
| POST   | `/sqs/message`         | 发送消息     |
| POST   | `/sqs/messages/batch`  | 批量发送消息 |
| POST   | `/sqs/message/receive` | 接收消息     |
| DELETE | `/sqs/message`         | 删除消息     |

### 统计信息

| 方法 | 路径                     | 描述             |
| ---- | ------------------------ | ---------------- |
| GET  | `/sqs/stats`             | 获取所有队列统计 |
| GET  | `/sqs/queue/:name/stats` | 获取指定队列统计 |

## 支持的AWS SQS功能

### ✅ 已支持

- CreateQueue - 创建队列
- DeleteQueue - 删除队列
- GetQueueUrl - 获取队列URL
- ListQueues - 列出队列
- GetQueueAttributes - 获取队列属性
- SendMessage - 发送消息
- SendMessageBatch - 批量发送消息
- ReceiveMessage - 接收消息
- DeleteMessage - 删除消息
- PurgeQueue - 清空队列
- 消息延迟发送 (DelaySeconds)
- 消息属性 (MessageAttributes)

### ❌ 暂未支持

- 死信队列 (DLQ)
- FIFO队列
- 消息去重
- 长轮询 (部分支持)
- 消息可见性超时
- 权限管理
- 加密

## 配置选项

队列默认属性：

```typescript
{
  VisibilityTimeout: '30',        // 可见性超时（秒）
  MessageRetentionPeriod: '1209600', // 消息保留期（秒，14天）
  DelaySeconds: '0',              // 延迟发送（秒）
  MaximumMessageSize: '262144'    // 最大消息大小（字节，256KB）
}
```

## 示例

### 完整示例

查看 `examples/sqs-usage.ts` 获取完整的使用示例：

```bash
npx ts-node examples/sqs-usage.ts
```

### AWS SDK兼容示例

查看 `examples/aws-sdk-adapter.ts` 获取AWS SDK兼容的使用示例：

```bash
npx ts-node examples/aws-sdk-adapter.ts
```

## 注意事项

1. **内存存储**: 所有数据存储在内存中，服务重启后数据会丢失
2. **单实例**: 目前只支持单个服务实例，不支持集群
3. **简化实现**: 某些AWS SQS的高级功能尚未实现
4. **开发用途**: 主要用于开发和测试，不建议在生产环境使用

## 故障排除

### 队列不存在错误

确保先创建队列再进行其他操作：

```typescript
// 先创建队列
const queueUrl = sqsService.createQueue('my-queue');
// 再进行其他操作
sqsService.sendMessage({ QueueUrl: queueUrl, MessageBody: 'test' });
```

### 消息接收不到

检查队列中是否有消息：

```typescript
// 获取队列统计信息
const stats = sqsService.getQueueStats('my-queue');
console.log('消息数量:', stats.messageCount);
```

## 扩展开发

如需添加新功能：

1. 在 `LocalSQSService` 中实现核心逻辑
2. 在 `QueueController` 中添加REST API接口
3. 在 `SQSAdapter` 中添加AWS SDK兼容接口
4. 更新文档和示例

## 许可证

MIT License
