# GitHub Pull Request 提交流程

## 问题背景

当仓库设置了保护规则时，直接推送到 `main` 分支会失败：

```bash
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: - Changes must be made through a pull request.
```

## 解决方案：通过 Pull Request 提交

### 1. 检查当前状态

```bash
# 查看当前分支状态
git status

# 查看所有分支（包括远程分支）
git branch -a
```

### 2. 切换到要提交的分支

```bash
# 切换到功能分支（例如：prisma-update）
git checkout <branch-name>
```

### 3. 创建 Pull Request

#### 方法一：使用 GitHub CLI（推荐）

```bash
# 检查是否安装了 GitHub CLI
gh --version

# 创建 PR
gh pr create --base main --head <branch-name> --title "PR标题" --body "PR描述"
```

#### 方法二：通过 GitHub 网页界面

1. 访问 GitHub 仓库页面
2. 点击 "Compare & pull request" 按钮
3. 填写 PR 标题和描述
4. 选择 base 分支（通常是 main）和 compare 分支
5. 点击 "Create pull request"

### 4. PR 流程

1. **等待代码审核**：团队成员会审核你的代码
2. **处理反馈**：如有需要，在原分支继续提交修改，PR会自动更新
3. **合并**：审核通过后，可以合并到目标分支
4. **清理**：合并后可以删除功能分支

## 实际案例

```bash
# 实际操作示例
git checkout prisma-update
gh pr create --base main --head prisma-update --title "Prisma update" --body "更新Prisma数据库表"
```

**生成的PR链接**：https://github.com/lihuiwen/agentflow-service/pull/1

## 注意事项

- 确保功能分支已同步到远程仓库
- PR描述要清晰，说明修改内容和目的
- 遵循团队的代码审核流程
- 合并前确保所有检查通过
