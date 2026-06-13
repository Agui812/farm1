const app = getApp();
const util = require('../../utils/util.js');

Page({
  data: {
    banners: [],
    categories: [],
    recommendGoods: []
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    if (this.getTabBar) {
      const tabBar = this.getTabBar();
      if (tabBar) tabBar.setData({ selected: 0 });
    }
  },

  async loadData() {
    wx.showLoading({ title: '加载中...' });

    try {
      let products = [];
      const [banners, categories] = await Promise.all([
        app.getBanners(),
        app.getCategories()
      ]);

      const productsRes = await app.getProductsWithMinPrice();
      if (productsRes && productsRes.length > 0) {
        products = productsRes;
      } else {
        products = await app.getProducts(1);
      }

      this.setData({
        banners: util.fixImageUrls(banners) || [],
        categories: categories || [],
        recommendGoods: util.fixImageUrls(products || []).slice(0, 4)
      });
    } catch (err) {
      console.error('Load data failed:', err);
      try {
        const products = await app.getProducts(1);
        this.setData({
          recommendGoods: (products || []).slice(0, 4)
        });
      } catch (e) {
        console.error('Fallback load failed:', e);
      }
    } finally {
      wx.hideLoading();
    }
  },

  goToGoodsList(e) {
    const category = e.currentTarget.dataset.category || 'all';
    wx.navigateTo({
      url: `/pages/goods/list/list?category=${category}`
    });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/goods/detail/detail?id=${id}`
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

    wx.showModal({
      title: '微信号',
      content: wechat + '\n点击确定复制微信号',
      confirmText: '复制',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: wechat,
            success: () => {
              wx.showToast({ title: '已复制', icon: 'success' });
            }
          });
        }
      }
    });
  }
});