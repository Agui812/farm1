const app = getApp();
const util = require('../../../utils/util.js');

Page({
  data: {
    order: null,
    loading: false
  },

  statusMap: {
    '1': '请尽快完成支付',
    '2': '商家正在准备商品',
    '3': '商品运输中，请注意查收',
    '4': '交易已完成',
    '5': '订单已取消'
  },

  pointStatusMap: {
    '1': '待发货',
    '2': '已发货',
    '3': '已完成',
    '4': '已取消'
  },

  onLoad(options) {
    const { orderId } = options;
    this.loadOrderDetail(orderId);
  },

  async loadOrderDetail(orderId) {
    this.setData({ loading: true });
    try {
      const order = await app.getOrderById(orderId);
      if (order) {
        let items = [];
        if (order.items) {
          if (typeof order.items === 'string') {
            try {
              items = JSON.parse(order.items);
            } catch (e) {
              items = [];
            }
          } else if (Array.isArray(order.items)) {
            items = order.items;
          }
        }

        const mappedItems = items.map(item => ({
          name: item.product_name || item.name || '',
          price: item.product_price || item.price || 0,
          image: util.fixImageUrl(item.product_image || item.image || ''),
          spec: item.sku_name || item.spec || '默认',
          num: item.num || 1
        }));

        const isPointExchange = order.is_point_exchange == 1;
        const statusMap = isPointExchange ? this.pointStatusMap : this.statusMap;
        const orderStatus = String(order.order_status);

        let logistics = null;
        if (orderStatus === '3' && !isPointExchange) {
          logistics = {
            company: '顺丰快递',
            trackingNo: 'SF' + String(order.id).padStart(10, '0'),
            traces: [
              { time: order.delivery_time || '', desc: '快件已签收，签收人：本人' },
              { time: '', desc: '快件正在派送中，快递员：张师傅 138****5678' },
              { time: '', desc: '快件已到达【沈阳新民市网点】' },
              { time: '', desc: '快件已从【沈阳转运中心】发出' },
              { time: '', desc: '快件已揽收，准备发往目的地' }
            ]
          };
        }

        this.setData({
          order: {
            ...order,
            items: mappedItems,
            isPointExchange,
            statusText: statusMap[orderStatus] || '未知状态',
            statusDesc: statusMap[orderStatus] || '',
            logistics
          }
        });
      }
    } catch (err) {
      console.error('Load order detail failed:', err);
      wx.showToast({ title: '加载订单失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  getStatusText(orderStatus) {
    const map = {
      '1': '待付款',
      '2': '待发货',
      '3': '待收货',
      '4': '已完成',
      '5': '已取消'
    };
    return map[orderStatus] || '未知状态';
  },

  async payOrder() {
    const orderId = this.data.order.id;

    wx.showModal({
      title: '支付演示',
      content: '订单号：' + orderId + '\n演示模式，不进行真实支付',
      confirmText: '确认支付',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.updateOrderStatus(orderId, 'paid');
            wx.navigateTo({
              url: `/pages/order/payResult/payResult?orderId=${orderId}&status=success`
            });
          } catch (err) {
            console.error('Pay order failed:', err);
          }
        }
      }
    });
  },

  async cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定取消该订单？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.updateOrderStatus(this.data.order.id, 'cancelled');
            wx.showToast({ title: '已取消', icon: 'success' });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } catch (err) {
            console.error('Cancel order failed:', err);
          }
        }
      }
    });
  },

  async confirmReceive() {
    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.updateOrderStatus(this.data.order.id, 'completed');
            wx.showToast({ title: '已确认收货', icon: 'success' });
            this.loadOrderDetail(this.data.order.id);
          } catch (err) {
            console.error('Confirm receive failed:', err);
          }
        }
      }
    });
  },

  contactSeller() {
    wx.showActionSheet({
      itemList: ['拨打电话', '添加微信'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({ phoneNumber: '13888888888' });
        } else {
          wx.setClipboardData({
            data: 'aimengnongchang',
            success: () => {
              wx.showToast({ title: '已复制微信号', icon: 'success' });
            }
          });
        }
      }
    });
  }
});