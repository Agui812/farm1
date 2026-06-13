const app = getApp();
const util = require('../../../utils/util.js');

Page({
  data: {
    goodsList: [],
    address: null,
    deliveryType: 1,
    freight: 0,
    goodsAmount: 0,
    vipDiscount: 0,
    totalAmount: 0,
    config: null,
    isVip: false,
    isPointGoods: false,
    pointGoods: null
  },

  onLoad(options) {
    this.loadConfig();
    this.checkVipStatus();
    this.setData({ deliveryType: 1 });

    if (!app.globalData.openid) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' });
          } else {
            wx.navigateBack();
          }
        }
      });
      return;
    }

    if (options.point_goods_id) {
      const pointGoods = {
        id: parseInt(options.point_goods_id) || 0,
        points: parseInt(options.point_goods_points) || 0,
        name: decodeURIComponent(options.point_goods_name),
        image: util.fixImageUrl(decodeURIComponent(options.point_goods_image))
      };
      this.setData({
        isPointGoods: true,
        pointGoods,
        goodsList: [{
          product_id: 0,
          sku_id: 0,
          name: pointGoods.name,
          price: 0,
          image: pointGoods.image,
          spec: '积分兑换',
          num: 1
        }]
      });
    } else {
      let goodsList = [];
      if (options.items) {
        const items = JSON.parse(decodeURIComponent(options.items));
        goodsList = items.map(item => ({
          product_id: item.product_id,
          sku_id: item.sku_id,
          name: item.name,
          price: item.price,
          image: item.image,
          spec: item.sku_name || item.spec,
          num: item.num
        }));
        this.setData({ goodsList });
      } else if (options.goods) {
        const goods = JSON.parse(decodeURIComponent(options.goods));
        goodsList = [{
          product_id: goods.id,
          sku_id: goods.sku_id,
          name: goods.name,
          price: goods.price,
          image: goods.image,
          spec: goods.sku_name || goods.spec,
          num: goods.num || 1
        }];
        this.setData({ goodsList });
      }
      this.calculateAmount();
    }

    this.loadDefaultAddress();
  },

  checkVipStatus() {
    const userInfo = app.globalData.userInfo;
    const isVip = userInfo && userInfo.is_vip === 1;
    this.setData({ isVip });
  },

  async loadConfig() {
    const config = await app.getConfig();
    if (config) {
      this.setData({ config });
      const freight = parseFloat(config.freight) || 0;
      this.setData({ freight });
      this.calculateAmount();
    }
  },

  onShow() {
    const addresses = app.globalData.addresses;
    const defaultAddr = addresses.find(a => a.is_default === 1) || addresses[0];
    this.setData({ address: defaultAddr });
    this.checkVipStatus();
  },

  async loadDefaultAddress() {
    try {
      const addresses = await app.getAddresses();
      if (addresses.length > 0) {
        const defaultAddr = addresses.find(a => a.is_default === 1) || addresses[0];
        this.setData({ address: defaultAddr });
      }
    } catch (err) {
      console.error('Load addresses failed:', err);
    }
  },

  onDeliveryChange(e) {
    const deliveryType = parseInt(e.detail);
    const freight = this.data.isVip ? 0 : (this.data.config ? parseFloat(this.data.config.freight) || 0 : 0);
    this.setData({ deliveryType, freight }, () => {
      this.calculateAmount();
    });
  },

  calculateAmount() {
    if (this.data.isPointGoods) {
      this.setData({
        goodsAmount: '0.00',
        vipDiscount: '0.00',
        freight: '0.00',
        totalAmount: '0.00'
      });
      return;
    }

    const goodsAmount = this.data.goodsList.reduce((sum, g) => {
      return sum + (g.price || 0) * (g.num || 1);
    }, 0);

    const vipDiscount = this.data.isVip ? 3 : 0;
    const freight = this.data.isVip ? 0 : (this.data.config ? parseFloat(this.data.config.freight) || 0 : 0);

    let totalAmount = goodsAmount + freight - vipDiscount;
    if (totalAmount < 0) totalAmount = 0;

    this.setData({
      goodsAmount: goodsAmount.toFixed(2),
      vipDiscount: vipDiscount.toFixed(2),
      freight: freight.toFixed(2),
      totalAmount: totalAmount.toFixed(2)
    });
  },

  selectAddress() {
    wx.navigateTo({ url: '/pages/address/address' });
  },

  async submitOrder() {
    if (!this.data.address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }

    if (this.data.isPointGoods) {
      await this.handlePointExchange();
      return;
    }

    const items = this.data.goodsList.map(g => ({
      product_id: parseInt(g.product_id) || 0,
      sku_id: parseInt(g.sku_id) || 0,
      sku_name: g.sku_name || g.spec || '',
      num: parseInt(g.num) || 1,
      total_points: 0
    }));

    try {
      const result = await app.createOrder(
        this.data.address.id,
        items,
        this.data.freight,
        this.data.deliveryType,
        this.data.isVip
      );

      if (result) {
        const orderItems = this.data.goodsList.map(g => ({
          product_id: parseInt(g.product_id) || 0,
          sku_id: parseInt(g.sku_id) || 0,
          sku_name: g.sku_name || g.spec || '',
          product_name: g.name || '',
          product_price: parseFloat(g.price) || 0,
          product_image: g.image || '',
          num: parseInt(g.num) || 1,
          total_points: 0
        }));
        const cachedOrders = wx.getStorageSync('cachedOrderItems') || {};
        cachedOrders[result.id] = orderItems;
        wx.setStorageSync('cachedOrderItems', cachedOrders);

        await this.handlePayment(result.id);
      }
    } catch (err) {
      console.error('Create order failed:', err);
      wx.showToast({ title: '创建订单失败', icon: 'none' });
    }
  },

  async handlePayment(orderId) {
    wx.showLoading({ title: '支付中...' });
    try {
      const api = require('../../../utils/api.js');
      await api.updateOrderStatus(orderId, 2);

      wx.hideLoading();
      wx.navigateTo({
        url: `/pages/order/payResult/payResult?orderId=${orderId}&status=success`
      });
    } catch (err) {
      wx.hideLoading();
      console.error('Payment failed:', err);
      wx.showToast({ title: '支付失败', icon: 'none' });
      wx.navigateTo({
        url: `/pages/order/payResult/payResult?orderId=${orderId}&status=fail`
      });
    }
  },

  async handlePointExchange() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo || !userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    if (!this.data.address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }

    const pointGoods = this.data.pointGoods;
    const currentPoints = parseInt(userInfo.points) || 0;
    const goodsPoints = parseInt(pointGoods.points) || 0;

    if (currentPoints < goodsPoints) {
      wx.showToast({ title: '积分不足', icon: 'none' });
      return;
    }

    try {
      const api = require('../../../utils/api.js');
      const result = await api.createPointExchange({
        user_id: parseInt(userInfo.id) || 0,
        goods_id: parseInt(pointGoods.id) || 0,
        address_id: parseInt(this.data.address.id) || 0,
        num: 1
      });

      userInfo.points = result.remaining_points;
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);

      wx.redirectTo({
        url: `/pages/order/payResult/payResult?status=success&isPointExchange=1&goodsName=${encodeURIComponent(pointGoods.name)}&orderNo=${result.order_no}`
      });
    } catch (err) {
      console.error('Point exchange failed:', err);
      wx.showToast({ title: '兑换失败: ' + (err.message || err.msg || ''), icon: 'none', duration: 3000 });
    }
  }
});