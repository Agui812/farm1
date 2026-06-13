const app = getApp();
const util = require('../../utils/util.js');

Page({
  data: {
    points: 0,
    signing: false,
    hasSignedToday: false,
    exchangeGoods: [],
    pointsHistory: []
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadPoints();
    this.checkSignInStatus();
    this.loadPointsHistory();
  },

  loadData() {
    this.loadExchangeGoods();
  },

  async loadPoints() {
    const userInfo = app.globalData.userInfo;
    if (userInfo && userInfo.id) {
      try {
        const api = require('../../utils/api.js');
        const result = await api.getPointsTotal(userInfo.id);
        const points = result ? result.total_points : (userInfo.points || 0);
        this.setData({ points });
        userInfo.points = points;
        app.globalData.userInfo = userInfo;
        wx.setStorageSync('userInfo', userInfo);
      } catch (err) {
        console.error('Load points failed:', err);
        this.setData({ points: userInfo.points || 0 });
      }
    }
  },

  checkSignInStatus() {
    const lastSignDate = wx.getStorageSync('lastSignDate') || '';
    const today = new Date().toDateString();
    this.setData({ hasSignedToday: lastSignDate === today });
  },

  async loadPointsHistory() {
    const userInfo = app.globalData.userInfo;
    if (userInfo && userInfo.id) {
      try {
        const api = require('../../utils/api.js');
        const history = await api.getPointsHistory(userInfo.id);
        this.setData({ pointsHistory: (history || []).slice(0, 10) });
      } catch (err) {
        console.error('Load points history failed:', err);
      }
    }
  },

  async loadExchangeGoods() {
    try {
      const api = require('../../utils/api.js');
      const exchangeGoods = await api.getPointGoodsAll();
      this.setData({ exchangeGoods: util.fixImageUrls(exchangeGoods || []).slice(0, 6) });
    } catch (err) {
      console.error('Load exchange goods failed:', err);
    }
  },

  async handleSignIn() {
    if (this.data.signing) return;
    if (!app.globalData.userInfo || !app.globalData.userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    if (this.data.hasSignedToday) {
      return;
    }

    this.setData({ signing: true });

    try {
      const userInfo = app.globalData.userInfo;
      const isVip = userInfo && userInfo.is_vip === 1;
      const signInPoints = isVip ? 20 : 10;

      const api = require('../../utils/api.js');
      await api.addPoints({
        user_id: userInfo.id,
        points: signInPoints,
        type: 'sign',
        remark: isVip ? '会员每日签到奖励' : '每日签到奖励'
      });

      wx.setStorageSync('lastSignDate', new Date().toDateString());

      const result = await api.getPointsTotal(userInfo.id);
      const newPoints = result ? result.total_points : (userInfo.points || 0) + signInPoints;

      userInfo.points = newPoints;
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);

      this.setData({
        points: newPoints,
        hasSignedToday: true
      });

      this.loadPointsHistory();

      wx.showToast({
        title: `签到成功 +${signInPoints}积分`,
        icon: 'success'
      });
    } catch (err) {
      console.error('Sign in failed:', err);
      wx.showToast({ title: '签到失败', icon: 'none' });
    } finally {
      this.setData({ signing: false });
    }
  },

  async handleExchange(e) {
    const goodsId = e.currentTarget.dataset.id;
    const goods = this.data.exchangeGoods.find(g => g.id === goodsId);
    if (!goods) return;

    const userInfo = app.globalData.userInfo;
    const currentPoints = userInfo.points || 0;

    if (currentPoints < goods.points) {
      wx.showToast({ title: '积分不足', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/order/confirm/confirm?point_goods_id=${goods.id}&point_goods_points=${goods.points}&point_goods_name=${encodeURIComponent(goods.name)}&point_goods_image=${encodeURIComponent(goods.image)}`
    });
  }
});