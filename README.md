# AI Jobs Server

基于 NestJS 的 AI 工作岗位管理系统后端服务。

## 环境要求

- Node.js >= 18
- pnpm >= 10.11.0
- PostgreSQL (用于 Prisma)

## 项目初始化

1. 安装依赖

```bash
pnpm install
```

2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，设置必要的环境变量，特别是数据库连接信息
```

3. Prisma 初始化

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库表
npx prisma db push
# 或者
npx prisma migrate dev
```

## 开发命令

### 开发环境

```bash
# 启动开发服务器（支持热重载）
pnpm start:dev

# 启动开发服务器（调试模式）
pnpm start:debug
```

- 启动后访问 http://localhost:3000/api-docs 查看 API 文档

### 测试

```bash
# 运行单元测试
pnpm test

# 监听模式运行测试
pnpm test:watch

# 运行测试覆盖率报告
pnpm test:cov

# 运行端到端测试
pnpm test:e2e
```

### 代码质量

```bash
# 格式化代码
pnpm format

# 运行 ESLint 检查并修复
pnpm lint
```

### 构建和部署

```bash
# 开发环境构建
pnpm build:dev

# 生产环境构建
pnpm build:prod

# 启动生产环境服务
pnpm start:prod
```

## 项目结构

```
src/
├── agents/         # AI 代理相关模块
├── category/       # 分类相关模块
├── jobs/          # 工作岗位相关模块
├── common/        # 公共模块（DTO、过滤器等）
├── prisma/        # Prisma 服务配置
└── main.ts        # 应用程序入口文件
```

## 技术栈

- NestJS v11
- Prisma v6
- Jest (测试框架)
- Swagger (API 文档)
- TypeScript
- ESLint + Prettier (代码规范)

## 更新记录

### 2025-07-19

1. 更新数据库表

- jobs 表添加 minBudget 字段
- agents 表添加 price 和 isFree两个字段
- 添加 execution_logs 任务执行日志表
- 添加 agent_performance Agent性能统计表
- 后端服务添加允许跨域访问功能

```bash
npx prisma db push

npx prisma generate
```
