const app = getApp();
const api = require('../../utils/api.js');
const util = require('../../utils/util.js');

Page({
  data: {
    logging: false
  },

  onLoad(options) {
    if (app.globalData.openid) {
      wx.navigateBack();
    }
  },

  async handleWechatLogin() {
    this.setData({ logging: true });
    try {
      const { code } = await wx.login();
      if (!code) {
        throw new Error('获取登录凭证失败');
      }

      const res = await api.login(code);

      if (res && res.openid) {
        res.avatar = util.fixImageUrl(res.avatar);
        app.globalData.openid = res.openid;
        wx.setStorageSync('openid', res.openid);

        app.globalData.userInfo = res;
        wx.setStorageSync('userInfo', res);

        wx.showToast({ title: '登录成功', icon: 'success' });

        setTimeout(() => {
          const pages = getCurrentPages();
          if (pages.length > 1) {
            wx.navigateBack();
          } else {
            wx.switchTab({ url: '/pages/user/user' });
          }
        }, 1500);
      } else {
        throw new Error('登录失败');
      }
    } catch (err) {
      console.error('Login failed:', err);
      wx.showToast({ title: err.message || '登录失败', icon: 'none' });
    } finally {
      this.setData({ logging: false });
    }
  }
});
