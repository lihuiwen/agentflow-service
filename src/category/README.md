# Category API 使用说明

## 接口概览

Category模块提供了完整的分类管理功能，包括增删改查操作。

## API 端点

### 1. 创建分类

- **POST** `/categories`
- **请求体**:

```json
{
  "title": "分类名称"
}
```

- **响应**: 创建的分类对象

### 2. 获取所有分类

- **GET** `/categories`
- **查询参数**:
  - `page` (可选): 页码，默认为1
  - `limit` (可选): 每页数量，默认为10
- **响应**:
  - 无分页参数时: 分类列表（按标题升序排列）
  - 有分页参数时: 分页对象，包含以下字段:
    ```json
    {
      "data": [], // 分类数据
      "total": 100, // 总数量
      "page": 1, // 当前页
      "limit": 10, // 每页数量
      "totalPages": 10, // 总页数
      "hasNext": true, // 是否有下一页
      "hasPrev": false // 是否有上一页
    }
    ```

### 3. 获取单个分类

- **GET** `/categories/:id`
- **参数**: `id` - 分类ID
- **响应**: 分类对象

### 4. 更新分类

- **PATCH** `/categories/:id`
- **参数**: `id` - 分类ID
- **请求体**:

```json
{
  "title": "新的分类名称"
}
```

- **响应**: 更新后的分类对象

### 5. 删除分类

- **DELETE** `/categories/:id`
- **参数**: `id` - 分类ID
- **响应**: 204 No Content

## 使用示例

```bash
# 创建分类
curl -X POST http://localhost:3000/categories \
  -H "Content-Type: application/json" \
  -d '{"title": "技术"}'

# 获取所有分类（不分页）
curl http://localhost:3000/categories

# 获取分类（分页）
curl "http://localhost:3000/categories?page=1&limit=5"

# 获取单个分类
curl http://localhost:3000/categories/cm123456

# 更新分类
curl -X PATCH http://localhost:3000/categories/cm123456 \
  -H "Content-Type: application/json" \
  -d '{"title": "前端技术"}'

# 删除分类
curl -X DELETE http://localhost:3000/categories/cm123456
```

## 错误处理

- `404 Not Found`: 分类不存在
- `400 Bad Request`: 请求参数错误
- `500 Internal Server Error`: 服务器内部错误
