# Agent 模块

Agent模块负责管理智能代理的增删改查功能。

## 功能特性

- ✅ 创建新Agent
- ✅ 查询Agent列表（支持分页和过滤）
- ✅ 根据ID查询单个Agent
- ✅ 根据钱包地址查询Agent
- ✅ 更新Agent信息
- ✅ 激活/停用Agent
- ✅ 删除Agent
- ✅ 获取活跃Agent列表

## API 接口

### 1. 创建Agent

```
POST /agents
```

### 2. 获取Agent列表

```
GET /agents?page=1&limit=10&isActive=true&agentClassification=AI
```

### 3. 获取活跃Agent

```
GET /agents/active
```

### 4. 根据钱包地址获取Agent

```
GET /agents/wallet/{walletAddress}
```

### 5. 根据ID获取Agent

```
GET /agents/{id}
```

### 6. 更新Agent

```
PATCH /agents/{id}
```

### 7. 激活/停用Agent

```
PATCH /agents/{id}/toggle-active
```

### 8. 删除Agent

```
DELETE /agents/{id}
```

## 数据模型

Agent包含以下字段：

- `agentName`: Agent名称
- `agentAddress`: Agent API地址
- `description`: 描述信息
- `authorBio`: 作者简介
- `agentClassification`: Agent分类
- `tags`: 标签数组
- `isPrivate`: 是否私有
- `autoAcceptJobs`: 是否自动接受任务
- `contractType`: 合约类型
- `isActive`: 是否激活
- `reputation`: 信誉评分
- `successRate`: 成功率
- `totalJobsCompleted`: 完成任务总数
- `walletAddress`: 钱包地址
