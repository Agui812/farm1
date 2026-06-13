-- ----------------------------
-- 艾萌农场小程序数据库（无购物车版）
-- ----------------------------
CREATE DATABASE IF NOT EXISTS `aimeng_farm` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `aimeng_farm`;

-- ----------------------------
-- 1. 用户表
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '用户主键',
  `openid` varchar(50) NOT NULL UNIQUE COMMENT '微信用户唯一标识',
  `nickname` varchar(50) DEFAULT '' COMMENT '微信昵称',
  `avatar` varchar(255) DEFAULT '' COMMENT '微信头像',
  `phone` varchar(11) DEFAULT '' COMMENT '手机号',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ----------------------------
-- 2. 商品表
-- ----------------------------
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '商品主键',
  `name` varchar(100) NOT NULL COMMENT '商品名称',
  `price` decimal(10,2) NOT NULL COMMENT '销售价格',
  `original_price` decimal(10,2) DEFAULT 0.00 COMMENT '原价',
  `image` varchar(255) NOT NULL COMMENT '商品主图',
  `images` text COMMENT '轮播图(逗号分隔)',
  `desc` text COMMENT '商品详情',
  `stock` int DEFAULT 999 COMMENT '库存',
  `status` tinyint DEFAULT 1 COMMENT '状态 1=上架 0=下架',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- ----------------------------
-- 3. 收货地址表
-- ----------------------------
DROP TABLE IF EXISTS `address`;
CREATE TABLE `address` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '地址主键',
  `user_id` int NOT NULL COMMENT '关联用户ID',
  `name` varchar(20) NOT NULL COMMENT '收货人姓名',
  `phone` varchar(11) NOT NULL COMMENT '收货人电话',
  `region` varchar(100) NOT NULL COMMENT '省市区',
  `detail` varchar(255) NOT NULL COMMENT '详细地址',
  `is_default` tinyint DEFAULT 0 COMMENT '1=默认地址 0=普通地址',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址表';

-- ----------------------------
-- 4. 订单主表（order为关键字，加反引号）
-- ----------------------------
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '订单主键',
  `order_no` varchar(30) NOT NULL UNIQUE COMMENT '订单编号',
  `user_id` int NOT NULL COMMENT '关联用户ID',
  `address_id` int NOT NULL COMMENT '关联收货地址ID',
  `total_price` decimal(10,2) NOT NULL COMMENT '商品总价',
  `freight` decimal(10,2) DEFAULT 0.00 COMMENT '运费',
  `real_price` decimal(10,2) NOT NULL COMMENT '实付款',
  `pay_type` tinyint DEFAULT 1 COMMENT '支付方式 1=微信支付',
  `order_status` tinyint NOT NULL DEFAULT 1 COMMENT '订单状态 1=待付款 2=待发货 3=待收货 4=已完成 5=已取消',
  `delivery_type` tinyint DEFAULT 1 COMMENT '配送方式 1=快递 2=自提',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `delivery_time` datetime DEFAULT NULL COMMENT '发货时间',
  `finish_time` datetime DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

-- ----------------------------
-- 5. 订单明细表
-- ----------------------------
DROP TABLE IF EXISTS `order_item`;
CREATE TABLE `order_item` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '明细主键',
  `order_id` int NOT NULL COMMENT '关联订单ID',
  `product_id` int NOT NULL COMMENT '关联商品ID',
  `product_name` varchar(100) NOT NULL COMMENT '商品名称快照',
  `product_price` decimal(10,2) NOT NULL COMMENT '商品单价快照',
  `product_image` varchar(255) NOT NULL COMMENT '商品图片快照',
  `num` int NOT NULL COMMENT '购买数量',
  `total_price` decimal(10,2) NOT NULL COMMENT '商品小计',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- ----------------------------
-- 6. 系统配置表
-- ----------------------------
DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '配置主键',
  `config_key` varchar(50) NOT NULL UNIQUE COMMENT '配置标识',
  `config_value` text NOT NULL COMMENT '配置内容',
  `remark` varchar(100) DEFAULT '' COMMENT '配置说明',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- ----------------------------
-- 插入测试数据
-- ----------------------------
INSERT INTO `user` (`openid`, `nickname`, `avatar`, `phone`) VALUES 
('o123456789', '测试用户', 'https://pic.com/avatar.jpg', '13800138000');

INSERT INTO `product` (`name`, `price`, `original_price`, `image`, `desc`, `status`) VALUES 
('东北珍珠米5kg', 49.90, 59.90, 'https://pic.com/rice1.jpg', '农家自产东北大米，软糯香甜', 1),
('有机长粒香米10kg', 99.90, 119.90, 'https://pic.com/rice2.jpg', '原生态种植，无添加', 1);

INSERT INTO `address` (`user_id`, `name`, `phone`, `region`, `detail`, `is_default`) VALUES 
(1, '张三', '13800138000', '辽宁省沈阳市新民市', '罗家房镇艾萌农场', 1);

INSERT INTO `config` (`config_key`, `config_value`, `remark`) VALUES 
('farm_info', '艾萌农场|新民市罗家房镇|13900139000|aimeng2025', '农场基础信息'),
('member_discount', '3', '会员立减金额'),
('freight', '0', '默认运费');