# 艾萌农场微信小程序

一个基于微信小程序的农产品电商应用，提供完整的商品浏览、购物车、订单管理、用户中心等功能。

## 项目简介

艾萌农场是一个专注于农产品销售的微信小程序，采用现代化的设计理念，提供流畅的购物体验。支持商品浏览、SKU规格选择、购物车管理、订单流程、地址管理、VIP会员体系、积分系统等核心功能。

## 功能特性

### 核心功能

- **首页展示**：轮播图、商品分类、推荐商品
- **商品模块**：商品列表、分类筛选、关键词搜索、商品详情、SKU选择
- **购物车**：商品管理、数量调整、全选操作、价格计算
- **订单流程**：订单确认、支付模拟、订单列表、订单详情、物流追踪
- **用户中心**：微信登录、每日签到、订单管理、地址管理
- **VIP会员**：会员特权、专属折扣、免运费
- **积分系统**：签到积分、积分兑换商品
- **地址管理**：新增、编辑、删除、默认地址设置

### 特色功能

- 自定义 TabBar，显示购物车商品数量角标
- 支持配送和自提两种配送方式
- VIP会员享受免运费、3元折扣、签到双倍积分
- 积分签到与兑换功能
- 多规格商品选择（SKU）
- 图片URL自动修复处理
- 本地缓存机制

## 技术栈

- **前端框架**：微信小程序原生开发
- **UI组件库**：Vant Weapp
- **后端接口**：RESTful API
- **样式方案**：自定义 WXSS
- **主题配色**：
  - 主背景色：`#F9F6F0`（米色）
  - 主色调：`#7CBD89`（绿色）
  - 辅助色：`#B9A385`（大地色）
  - 价格色：`#D6543A`（红色）

## 项目结构

```
farm/
├── app.js                    # 小程序入口文件
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── custom-tab-bar/           # 自定义底部导航栏
│   ├── index.js
│   ├── index.json
│   ├── index.wxml
│   └── index.wxss
├── pages/                    # 页面目录
│   ├── index/               # 首页
│   ├── goods/               # 商品模块
│   │   ├── list/           # 商品列表
│   │   └── detail/         # 商品详情
│   ├── cart/               # 购物车
│   ├── order/              # 订单模块
│   │   ├── confirm/        # 订单确认
│   │   ├── list/           # 订单列表
│   │   ├── detail/         # 订单详情
│   │   └── payResult/      # 支付结果
│   ├── user/               # 用户中心
│   ├── login/              # 登录页
│   ├── address/            # 地址管理
│   │   └── add/            # 新增/编辑地址
│   ├── vip/                # VIP会员
│   ├── points/             # 积分中心
│   └── contact/            # 联系我们
├── utils/                  # 工具函数
│   ├── api.js             # API接口封装
│   ├── util.js            # 通用工具函数
│   └── area.js            # 地区数据
└── miniprogram_npm/        # npm包（Vant Weapp）
```

## 快速开始

### 环境准备

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 注册微信小程序账号（可使用测试号）

### 运行项目

1. 克隆项目到本地
```bash
git clone <repository-url>
cd farm
```

2. 打开微信开发者工具
3. 导入项目，选择项目目录 `farm`
4. 填写 AppID（可使用测试号或项目中已配置的ID）
5. 点击"导入"

### 后端服务

项目需要配合后端API服务运行，默认API地址：`http://localhost:3000/api`

如需修改API地址，请编辑 `utils/api.js` 文件中的 `API_BASE` 常量。

## 页面路由

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `/pages/index/index` | 轮播图、分类、推荐商品 |
| 产品列表 | `/pages/goods/list/list` | 商品浏览、搜索、筛选 |
| 产品详情 | `/pages/goods/detail/detail` | 商品信息、SKU选择 |
| 购物车 | `/pages/cart/cart` | 商品管理、结算 |
| 订单确认 | `/pages/order/confirm/confirm` | 地址选择、订单提交 |
| 订单列表 | `/pages/order/list/list` | 订单查看、状态筛选 |
| 订单详情 | `/pages/order/detail/detail` | 订单信息、物流追踪 |
| 支付结果 | `/pages/order/payResult/payResult` | 支付状态展示 |
| 用户中心 | `/pages/user/user` | 个人信息、功能入口 |
| 登录 | `/pages/login/login` | 微信授权登录 |
| 地址管理 | `/pages/address/address` | 地址列表 |
| 新增地址 | `/pages/address/add/add` | 地址编辑 |
| VIP会员 | `/pages/vip/vip` | 会员特权 |
| 积分中心 | `/pages/points/points` | 积分明细、兑换 |
| 联系我们 | `/pages/contact/contact` | 联系方式 |

## API接口

### 基础配置

- 基础URL：`http://localhost:3000/api`
- 请求格式：JSON
- 响应格式：`{ code: 0, data: {}, message: '' }`

### 主要接口

#### 用户相关
- `POST /user/login` - 用户登录
- `GET /user/openid/:openid` - 获取用户信息
- `PUT /user/:id` - 更新用户信息

#### 商品相关
- `GET /product` - 获取商品列表
- `GET /product/with-min-price` - 获取含最低价商品
- `GET /product/:id` - 获取商品详情
- `GET /product-sku/product/:productId` - 获取商品SKU列表

#### 购物车相关
- `GET /cart/user/:userId` - 获取用户购物车
- `POST /cart` - 添加商品到购物车
- `PUT /cart/:id` - 更新购物车商品
- `DELETE /cart/:id` - 删除购物车商品

#### 订单相关
- `POST /order` - 创建订单
- `GET /order/user/:userId` - 获取用户订单
- `GET /order/:id` - 获取订单详情
- `PUT /order/:id/status` - 更新订单状态

#### 地址相关
- `GET /address/user/:userId` - 获取用户地址
- `POST /address` - 新增地址
- `PUT /address/:id` - 更新地址
- `DELETE /address/:id` - 删除地址

#### 积分相关
- `GET /user-points/user/:userId` - 获取积分历史
- `GET /user-points/user/:userId/total` - 获取积分总额
- `POST /user-points` - 添加积分
- `GET /point-goods/all/list` - 获取积分商品
- `POST /point-exchange` - 创建积分兑换

## 全局状态管理

小程序通过 `app.js` 中的 `globalData` 管理全局状态：

```javascript
globalData: {
  userInfo: null,      // 用户信息
  openid: null,        // 用户openid
  cart: [],            // 购物车数据
  addresses: [],       // 地址列表
  config: null         // 系统配置
}
```

## 开发规范

### 代码风格

- 使用 ES6+ 语法
- 函数命名采用驼峰命名法
- 常量使用大写下划线
- 组件命名使用连字符

### 样式规范

- 使用 rpx 单位适配不同屏幕
- 遵循 BEM 命名规范
- 颜色值统一使用项目主题色

### 提交规范

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具调整

## 常见问题

### Q: 如何修改API地址？
A: 编辑 `utils/api.js` 文件中的 `API_BASE` 常量。

### Q: 购物车数据存储在何处？
A: 购物车数据同时存储在 `app.globalData.cart` 和本地缓存中，使用 `wx.getStorageSync('cart')` 读取。

### Q: 如何配置VIP特权？
A: VIP特权在 `app.js` 的 `createOrder` 方法中配置，包括免运费和折扣金额。

### Q: 积分签到规则是什么？
A: 普通用户每日签到+10积分，VIP用户+20积分，签到状态存储在本地缓存 `lastSignDate`。

## 浏览器支持

- 微信版本：>= 7.0.0
- 基础库版本：>= 2.10.0

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系：
- 微信：aimeng2025
- 电话：13900139000

---

**注意**：本项目为演示项目，支付功能为模拟实现，不涉及真实支付。