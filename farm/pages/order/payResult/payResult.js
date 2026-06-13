const app = getApp();

Page({
  data: {
    status: 'success',
    orderId: '',
    orderNo: '',
    orderInfo: {},
    isPointExchange: false,
    goodsName: ''
  },

  onLoad(options) {
    const { orderId, status, isPointExchange, goodsName, orderNo } = options;
    this.setData({
      status: status || 'success',
      orderId: orderId || '',
      orderNo: orderNo || '',
      isPointExchange: isPointExchange === '1',
      goodsName: goodsName ? decodeURIComponent(goodsName) : ''
    });
    this.loadOrderDetail(orderId);
  },

  async loadOrderDetail(orderId) {
    if (!orderId) return;
    try {
      const order = await app.getOrderById(orderId);
      if (order) {
        this.setData({
          orderNo: order.order_no || order.orderNo || '',
          orderInfo: {
            totalPrice: order.total_price || order.totalAmount || 0,
            createTime: order.create_time || order.createTime || ''
          }
        });
      }
    } catch (err) {
      console.error('Load order detail failed:', err);
    }
  },

  viewOrder() {
    wx.redirectTo({
      url: `/pages/order/detail/detail?orderId=${this.data.orderId}`
    });
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});