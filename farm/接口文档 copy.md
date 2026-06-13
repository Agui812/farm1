# 艾萌农场后台管理系统 API 接口文档

## 基本信息

- **基础URL**: `http://localhost:3000/api`
- **返回格式**: JSON
- **通用响应结构**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {}
}
```
- **code说明**: `0` 成功，`404` 未找到，`500` 服务器错误

---

## 健康检查

### GET /health
服务健康检查

**响应示例**:
```json
{
  "code": 0,
  "message": "OK"
}
```

---

## 用户管理 (/user)

### GET /user/all/list
获取所有用户列表

**响应示例**:
```json
{
  "code": 0,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "openid": "o123456789",
      "nickname": "测试用户",
      "avatar": "https://pic.com/avatar.jpg",
      "phone": "13800138000",
      "create_time": "2026-04-17T00:59:44.000Z",
      "update_time": "2026-04-17T00:59:44.000Z"
    }
  ]
}
```

### GET /user/:openid
根据openid获取单个用户

**参数**: openid - 微信用户唯一标识

**响应示例**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "id": 1,
    "openid": "o123456789",
    "nickname": "测试用户",
    "avatar": "https://pic.com/avatar.jpg",
    "phone": "13800138000"
  }
}
```

### POST /user
创建用户

**请求体**:
```json
{
  "openid": "o987654321",
  "nickname": "新用户",
  "avatar": "https://pic.com/new.jpg",
  "phone": "13900139000"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "创建成功",
  "data": { "id": 2 }
}
```

### PUT /user/:openid
更新用户信息

**请求体**:
```json
{
  "nickname": "更新昵称",
  "avatar": "https://pic.com/update.jpg",
  "phone": "13900139001"
}
```

---

## 商品管理 (/product)

### GET /product/with-min-price
获取上架商品列表（含最低规格价格）

**响应示例**:
```json
{
  "code": 0,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "name": "东北珍珠米5kg",
      "image": "https://pic.com/rice1.jpg",
      "images": "",
      "desc": "农家自产东北大米",
      "status": 1,
      "cate_id": 1,
      "min_price": 49.90,
      "create_time": "2026-04-17T00:59:44.000Z"
    }
  ]
}
```

**说明**: 只返回 status=1 的上架商品，min_price 为该商品下所有规格的最低价格

### GET /product
获取商品列表（管理端用，支持状态筛选）

**查询参数**:
- `status` (可选): 商品状态筛选，1=上架，0=下架
- `cate_id` (可选): 分类ID筛选

**响应示例**:
```json
{
  "code": 0,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "name": "东北珍珠米5kg",
      "image": "https://pic.com/rice1.jpg",
      "images": "",
      "desc": "农家自产东北大米",
      "status": 1,
      "cate_id": 1,
      "min_price": 49.90,
      "create_time": "2026-04-17T00:59:44.000Z"
    }
  ]
}
```

**说明**: 管理端使用，min_price 为该商品下所有规格的最低价格

### GET /product/:id
获取单个商品详情（含最低规格价格）

### POST /product
创建商品

**请求体**:
```json
{
  "name": "有机长粒香米10kg",
  "image": "https://pic.com/rice2.jpg",
  "images": "https://pic.com/rice2_1.jpg,https://pic.com/rice2_2.jpg",
  "desc": "原生态种植，无添加",
  "cate_id": 1,
  "status": 1
}
```

**说明**: 商品价格、库存等规格信息通过商品规格管理接口(/product-sku)单独管理

### PUT /product/:id
更新商品信息（字段说明同创建）

### DELETE /product/:id
删除商品

---

## 地址管理 (/address)

### GET /address/all/list
获取所有地址列表（含用户信息）

**响应示例**:
```json
{
  "code": 0,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "user_nickname": "测试用户",
      "name": "张三",
      "phone": "13800138000",
      "region": "辽宁省沈阳市新民市",
      "detail": "罗家房镇艾萌农场",
      "is_default": 1,
      "create_time": "2026-04-17T00:59:44.000Z"
    }
  ]
}
```

### GET /address/user/:userId
获取指定用户的地址列表

### GET /address/:id
获取单个地址详情

### POST /address
创建地址

**请求体**:
```json
{
  "user_id": 1,
  "name": "李四",
  "phone": "13800138001",
  "region": "北京市朝阳区",
  "detail": "某街道某号",
  "is_default": 0
}
```

### PUT /address/:id
更新地址信息

### DELETE /address/:id
删除地址

---

## 订单管理 (/order)

### GET /order/all
获取所有订单列表（含用户、地址信息）

**响应示例**:
```json
{
  "code": 0,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "order_no": "ORD1234567890ABCDEF",
      "user_id": 1,
      "user_nickname": "测试用户",
      "user_phone": "13800138000",
      "address_id": 1,
      "address_name": "张三",
      "address_phone": "13800138000",
      "region": "辽宁省沈阳市新民市",
      "detail": "罗家房镇艾萌农场",
      "total_price": 99.90,
      "freight": 0.00,
      "real_price": 96.90,
      "pay_type": 1,
      "order_status": 2,
      "delivery_type": 1,
      "create_time": "2026-04-17T00:59:44.000Z",
      "pay_time": null,
      "delivery_time": null,
      "finish_time": null,
      "items": [
        {
          "id": 1,
          "order_id": 1,
          "product_id": 1,
          "product_name": "东北珍珠米5kg",
          "product_price": 49.90,
          "product_image": "https://pic.com/rice1.jpg",
          "num": 2,
          "total_price": 99.90
        }
      ]
    }
  ]
}
```

### GET /order/user/:userId
获取指定用户的订单列表

### GET /order/:id
获取单个订单详情（含订单商品明细）

### POST /order
创建订单

**请求体**:
```json
{
  "user_id": 1,
  "address_id": 1,
  "items": [
    { "product_id": 1, "num": 2 },
    { "product_id": 2, "num": 1 }
  ],
  "freight": 0,
  "delivery_type": 1
}
```

**说明**:
- 自动计算商品总价
- 自动应用会员折扣（从config表读取member_discount）
- 自动生成订单编号
- 自动扣减库存

### PUT /order/:id/status
更新订单状态

**请求体**:
```json
{
  "order_status": 3
}
```

**订单状态码**:
| 状态码 | 说明 |
|--------|------|
| 1 | 待付款 |
| 2 | 待发货 |
| 3 | 待收货 |
| 4 | 已完成 |
| 5 | 已取消 |

**自动时间戳**:
- 状态改为2时：自动设置pay_time
- 状态改为3时：自动设置delivery_time
- 状态改为4时：自动设置finish_time

---

## 分类管理 (/category)

### GET /category/all/list
获取所有分类列表

**响应示例**:
```json
{
  "code": 0,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "name": "大米类",
      "image": "https://pic.com/category/rice.png",
      "sort": 0,
      "status": 1
    }
  ]
}
```

### GET /category/:id
获取单个分类详情

### POST /category
创建分类

**请求体**:
```json
{
  "name": "杂粮类",
  "image": "https://pic.com/category/grain.png",
  "sort": 1,
  "status": 1
}
```

### PUT /category/:id
更新分类信息

### DELETE /category/:id
删除分类

---

## 轮播图管理 (/banner)

### GET /banner/all/list
获取所有轮播图列表

**响应示例**:
```json
{
  "code": 0,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "title": "春季促销",
      "image": "https://pic.com/banner/spring.jpg",
      "sort": 0,
      "status": 1
    }
  ]
}
```

### GET /banner/:id
获取单个轮播图详情

### POST /banner
创建轮播图

**请求体**:
```json
{
  "title": "夏日特惠",
  "image": "https://pic.com/banner/summer.jpg",
  "sort": 1,
  "status": 1
}
```

**说明**: image字段必填

### PUT /banner/:id
更新轮播图信息

### DELETE /banner/:id
删除轮播图

---

## 购物车管理 (/cart)

### GET /cart/all/list
获取所有购物车记录列表（含用户、商品信息）

**响应示例**:
```json
{
  "code": 0,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "user_nickname": "测试用户",
      "product_id": 1,
      "product_name": "东北珍珠米5kg",
      "product_price": 49.90,
      "product_image": "https://pic.com/rice1.jpg",
      "num": 2,
      "is_checked": 1,
      "create_time": "2026-04-17T00:59:44.000Z",
      "update_time": "2026-04-17T00:59:44.000Z"
    }
  ]
}
```

### GET /cart/user/:userId
获取指定用户的购物车列表

### POST /cart
添加商品到购物车

**请求体**:
```json
{
  "user_id": 1,
  "product_id": 1,
  "num": 1,
  "is_checked": 1
}
```

**说明**:
- 如果该用户对该商品已有购物车记录，则数量叠加
- 否则创建新记录

### PUT /cart/:id
更新购物车记录

**请求体**:
```json
{
  "num": 3,
  "is_checked": 0
}
```

### DELETE /cart/:id
删除购物车记录

---

## 商品规格管理 (/product-sku)

**说明**: 商品价格、库存等信息存储在商品规格表中，一个商品可有多个规格（如不同包装规格）

### GET /product-sku/all/list
获取所有规格列表

**响应示例**:
```json
{
  "code": 0,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "sku_name": "5kg袋装",
      "price": 49.90,
      "stock": 100,
      "status": 1
    }
  ]
}
```

### GET /product-sku/product/:productId
获取指定商品的规格列表

### GET /product-sku/:id
获取单个规格详情

### POST /product-sku
创建规格

**请求体**:
```json
{
  "product_id": 1,
  "sku_name": "10kg袋装",
  "price": 89.90,
  "stock": 50,
  "status": 1
}
```

### PUT /product-sku/:id
更新规格信息

### DELETE /product-sku/:id
删除规格

---

## 系统配置 (/config)

### GET /config/all
获取所有系统配置

**响应示例**:
```json
{
  "code": 0,
  "message": "OK",
  "data": {
    "farm_info": "艾萌农场|新民市罗家房镇|13900139000|aimeng2025",
    "member_discount": "3",
    "freight": "0"
  }
}
```

### PUT /config/:key
更新指定配置

**请求体**:
```json
{
  "config_value": "新配置内容"
}
```

---

## 数据库表结构

### user (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| openid | varchar(50) | 微信用户唯一标识 |
| nickname | varchar(50) | 微信昵称 |
| avatar | varchar(255) | 微信头像 |
| phone | varchar(11) | 手机号 |
| create_time | datetime | 创建时间 |
| update_time | datetime | 更新时间 |

### product (商品表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| name | varchar(100) | 商品名称 |
| image | varchar(255) | 商品主图 |
| images | text | 轮播图(逗号分隔) |
| desc | text | 商品详情 |
| cate_id | int | 分类ID |
| status | tinyint | 状态 1=上架 0=下架 |
| create_time | datetime | 创建时间 |

**说明**: 价格、库存等规格信息存储在 product_sku 表中

### address (收货地址表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| user_id | int | 关联用户ID |
| name | varchar(20) | 收货人姓名 |
| phone | varchar(11) | 收货人电话 |
| region | varchar(100) | 省市区 |
| detail | varchar(255) | 详细地址 |
| is_default | tinyint | 1=默认地址 0=普通地址 |
| create_time | datetime | 创建时间 |

### order (订单主表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| order_no | varchar(30) | 订单编号 |
| user_id | int | 关联用户ID |
| address_id | int | 关联收货地址ID |
| total_price | decimal(10,2) | 商品总价 |
| freight | decimal(10,2) | 运费 |
| real_price | decimal(10,2) | 实付款 |
| pay_type | tinyint | 支付方式 1=微信支付 |
| order_status | tinyint | 订单状态 |
| delivery_type | tinyint | 配送方式 1=快递 2=自提 |
| create_time | datetime | 下单时间 |
| pay_time | datetime | 支付时间 |
| delivery_time | datetime | 发货时间 |
| finish_time | datetime | 完成时间 |

### order_item (订单明细表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| order_id | int | 关联订单ID |
| product_id | int | 关联商品ID |
| product_name | varchar(100) | 商品名称快照 |
| product_price | decimal(10,2) | 商品单价快照 |
| product_image | varchar(255) | 商品图片快照 |
| num | int | 购买数量 |
| total_price | decimal(10,2) | 商品小计 |

### category (商品分类表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| name | varchar(50) | 分类名称 |
| image | varchar(255) | 分类图标 |
| sort | int | 排序 |
| status | tinyint | 状态 1=启用 0=禁用 |

### banner (轮播图表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| title | varchar(100) | 标题 |
| image | varchar(255) | 图片URL |
| sort | int | 排序 |
| status | tinyint | 状态 1=启用 0=禁用 |

### cart (购物车表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| user_id | int | 用户ID |
| product_id | int | 商品ID |
| num | int | 数量 |
| is_checked | tinyint | 是否选中 1=选中 0=未选 |
| create_time | datetime | 添加时间 |
| update_time | datetime | 更新时间 |

### product_sku (商品规格表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| product_id | int | 关联商品ID |
| sku_name | varchar(100) | 规格名称（如：5kg袋装） |
| price | decimal(10,2) | 规格价格 |
| stock | int | 规格库存 |
| status | tinyint | 状态 1=启用 0=禁用 |

### config (系统配置表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| config_key | varchar(50) | 配置标识 |
| config_value | text | 配置内容 |
| remark | varchar(100) | 配置说明 |
