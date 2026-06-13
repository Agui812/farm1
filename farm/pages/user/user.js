const app = getApp();
const util = require('../../utils/util.js');

Page({
  data: {
    hasLogin: false,
    logging: false,
    signing: false,
    hasSignedToday: false,
    userInfo: {}
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 3 });
    }
    this.checkLoginStatus();
    this.checkSignInStatus();
  },

  checkLoginStatus() {
    const userInfo = app.globalData.userInfo;
    const hasLogin = !!(userInfo && userInfo.openid);
    this.setData({
      hasLogin,
      userInfo: userInfo || {}
    });
  },

  checkSignInStatus() {
    const lastSignDate = wx.getStorageSync('lastSignDate') || '';
    const today = new Date().toDateString();
    this.setData({ hasSignedToday: lastSignDate === today });
  },

  async handleSignIn() {
    if (this.data.signing) return;
    if (!this.data.hasLogin) {
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
      const newPoints = (userInfo.points || 0) + signInPoints;

      await api.updateUser(userInfo.id, { points: newPoints });

      userInfo.points = newPoints;
      app.globalData.userInfo = userInfo;
      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('lastSignDate', new Date().toDateString());

      this.setData({
        userInfo,
        hasSignedToday: true
      });

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

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  async handleLogin() {
    if (this.data.logging) return;

    this.setData({ logging: true });

    try {
      const codeRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });

      if (!codeRes.code) {
        throw new Error('获取code失败');
      }

      const api = require('../../utils/api.js');
      const loginResult = await api.login(codeRes.code);

      if (!loginResult) {
        throw new Error('登录失败');
      }

      app.globalData.userInfo = loginResult;
      app.globalData.openid = loginResult.openid;

      wx.setStorageSync('userInfo', loginResult);

      this.setData({
        hasLogin: true,
        userInfo: loginResult
      });

      wx.showToast({ title: '登录成功', icon: 'success' });

    } catch (err) {
      console.error('Login failed:', err);
      if (err.errMsg && err.errMsg.includes('authorize')) {
        wx.showToast({ title: '请允许授权', icon: 'none' });
      } else if (err.errMsg && err.errMsg.includes('getUserProfile')) {
        wx.showToast({ title: '请允许获取用户信息', icon: 'none' });
      } else {
        wx.showToast({ title: '登录失败', icon: 'none' });
      }
    } finally {
      this.setData({ logging: false });
    }
  },

  goToOrders(e) {
    if (!this.checkLogin()) return;
    const status = e.currentTarget.dataset.status || 'all';
    wx.navigateTo({
      url: `/pages/order/list/list?status=${status}`
    });
  },

  goToAddress() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/address/address'
    });
  },

  goToContact() {
    wx.navigateTo({
      url: '/pages/contact/contact'
    });
  },

  goToVip() {
    wx.navigateTo({
      url: '/pages/vip/vip'
    });
  },

  goToPoints() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/points/points'
    });
  },

  callPhone() {
    const config = app.globalData.config;
    const farmInfo = config ? config.farm_info : null;
    let phone = '13900139000';

    if (farmInfo) {
      const parts = farmInfo.split('|');
      if (parts[2]) phone = parts[2];
    }

    wx.showModal({
      title: '联系电话',
      content: phone + '\n点击确定将拨打此电话',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: phone.replace(/-/g, '') });
        }
      }
    });
  },

  copyWechat() {
    const config = app.globalData.config;
    const farmInfo = config ? config.farm_info : null;
    let wechat = 'aimeng2025';

    if (farmInfo) {
      const parts = farmInfo.split('|');
      if (parts[3]) wechat = parts[3];
    }

    wx.setClipboardData({
      data: wechat,
      success: () => {
        wx.showToast({ title: '微信号已复制', icon: 'success' });
      }
    });
  },

  checkLogin() {
    if (!this.data.hasLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return false;
    }
    return true;
  }
});



