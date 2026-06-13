const app = getApp();
const util = require('../../../utils/util.js');

Page({
  data: {
    activeTab: 'all',
    filteredOrders: [],
    loading: false,
    statusMap: {
      'all': '',
      'pending': 'pending',
      'paid': 'paid',
      'shipped': 'shipped',
      'completed': 'completed',
      'cancelled': 'cancelled'
    },
    reverseStatusMap: {
      '待付款': 'pending',
      '待发货': 'paid',
      '待收货': 'shipped',
      '已完成': 'completed',
      '已取消': 'cancelled'
    }
  },

  onShow() {
    this.loadOrders();
  },

  async loadOrders() {
    this.setData({ loading: true });
    try {
      const orders = await app.getOrders();

      const mappedOrders = await Promise.all(orders.map(async (order) => {
        let items = order.items || order.goods || [];
        if (!items || items.length === 0 || (items.length === 1 && !items[0].name)) {
          try {
            const detail = await app.getOrderById(order.id);
            items = detail ? (detail.items || detail.goods || []) : [];
          } catch (err) {
            console.error('Get order items failed:', err);
          }
        }

        let totalPoints = 0;
        let isPointExchange = false;
        const mappedItems = items.map(item => {
          const itemPoints = item.total_points || 0;
          const skuName = item.sku_name || item.spec || item.product_spec || '';
          const isItemPointExchange = itemPoints > 0 || skuName === '积分兑换';
          if (isItemPointExchange) {
            isPointExchange = true;
            totalPoints += itemPoints;
          }
          return {
            name: item.product_name || item.name || '',
            price: item.product_price || item.price || 0,
            image: util.fixImageUrl(item.product_image || item.image || ''),
            spec: skuName || '默认',
            num: item.num || 1
          };
        });

        const statusText = isPointExchange
          ? this.getPointStatusText(order.order_status)
          : this.getStatusText(order.order_status);

        let logistics = null;
        const orderStatusStr = String(order.order_status);
        if (orderStatusStr === '3' && !isPointExchange) {
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

        return {
          ...order,
          statusText,
          items: mappedItems,
          create_time: order.create_time || order.createTime || '',
          total_price: order.total_price || order.totalAmount || 0,
          is_point_exchange: isPointExchange ? 1 : 0,
          points: totalPoints,
          logistics
        };
      }));

      let filteredOrders = mappedOrders;
      const activeTab = this.data.activeTab;

      if (activeTab !== 'all') {
        const statusMapping = {
          'pending': ['1', '待付款'],
          'paid': ['2', '待发货'],
          'shipped': ['3', '待收货'],
          'completed': ['4', '已完成'],
          'cancelled': ['5', '已取消']
        };
        const validStatuses = statusMapping[activeTab] || [];
        filteredOrders = mappedOrders.filter(o => {
          return validStatuses.includes(String(o.order_status));
        });
      }

      this.setData({ filteredOrders });
    } catch (err) {
      console.error('Load orders failed:', err);
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
      '5': '已取消',
      '待付款': '待付款',
      '待发货': '待发货',
      '待收货': '待收货',
      '已完成': '已完成',
      '已取消': '已取消'
    };
    return map[orderStatus] || '未知状态';
  },

  getPointStatusText(orderStatus) {
    const map = {
      '1': '待发货',
      '2': '已发货',
      '3': '已完成',
      '4': '已取消'
    };
    return map[orderStatus] || '未知状态';
  },

  onTabChange(e) {
    this.setData({ activeTab: e.detail.name }, () => {
      this.loadOrders();
    });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail/detail?orderId=${id}`
    });
  },

  async payOrder(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '支付演示',
      content: '订单号：' + id + '\n演示模式，不进行真实支付',
      confirmText: '确认支付',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.updateOrderStatus(id, '待付款');
            wx.navigateTo({
              url: `/pages/order/payResult/payResult?orderId=${id}&status=success`
            });
          } catch (err) {
            console.error('Pay order failed:', err);
          }
        }
      }
    });
  },

  async receiveOrder(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认收货',
      content: '确认已收到商品？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.updateOrderStatus(id, '待收货');
            this.loadOrders();
            wx.showToast({ title: '已确认收货', icon: 'success' });
          } catch (err) {
            console.error('Receive order failed:', err);
          }
        }
      }
    });
  },

  stopPropagation() {},

  preventTap() {},

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});