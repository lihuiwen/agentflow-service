# Job 模块

Job模块负责管理任务的增删改查功能。

## 功能特性

- ✅ 创建新Job
- ✅ 查询Job列表（支持分页和过滤）
- ✅ 根据ID查询单个Job（包含分发记录）
- ✅ 根据钱包地址查询Job列表
- ✅ 更新Job信息
- ✅ 更新Job状态
- ✅ 删除Job
- ✅ 获取开放状态Job列表
- ✅ 获取即将到期Job列表
- ✅ 获取Job分类统计

## API 接口

### 1. 创建Job

```
POST /jobs
```

### 2. 获取Job列表

```
GET /jobs?page=1&limit=10&status=OPEN&category=AI&priority=high
```

### 3. 获取开放状态Job

```
GET /jobs/open
```

### 4. 获取即将到期Job

```
GET /jobs/expiring?days=7
```

### 5. 获取Job分类统计

```
GET /jobs/stats/category
```

### 6. 根据钱包地址获取Job

```
GET /jobs/wallet/{walletAddress}
```

### 7. 根据ID获取Job

```
GET /jobs/{id}
```

### 8. 更新Job

```
PATCH /jobs/{id}
```

### 9. 更新Job状态

```
PATCH /jobs/{id}/status
```

### 10. 删除Job

```
DELETE /jobs/{id}
```

## 数据模型

Job包含以下字段：

- `jobTitle`: 任务标题
- `category`: 任务分类
- `description`: 任务描述
- `deliverables`: 交付物要求
- `budget`: 预算（JSON格式，支持固定价格或价格区间）
- `maxBudget`: 最大预算
- `deadline`: 截止时间
- `paymentType`: 支付类型
- `priority`: 优先级
- `skillLevel`: 技能水平要求
- `tags`: 标签数组
- `status`: 任务状态（OPEN/DISTRIBUTED/IN_PROGRESS/COMPLETED/CANCELLED/EXPIRED）
- `autoAssign`: 是否自动分配
- `allowBidding`: 是否允许竞标
- `allowParallelExecution`: 是否允许并行执行
- `escrowEnabled`: 是否启用托管
- `isPublic`: 是否公开
- `walletAddress`: 钱包地址

## 状态管理

Job支持以下状态：

- `OPEN`: 开放状态，等待分配
- `DISTRIBUTED`: 已分发给多个Agent
- `IN_PROGRESS`: 进行中
- `COMPLETED`: 已完成
- `CANCELLED`: 已取消
- `EXPIRED`: 已过期

## 高级功能

### 过滤查询

支持多种过滤条件：

- 按分类过滤
- 按状态过滤
- 按优先级过滤
- 按技能水平过滤
- 按标签过滤
- 按预算范围过滤
- 按可见性过滤

### 统计分析

- 按分类统计Job数量
- 即将到期任务提醒
- 支持自定义时间范围
