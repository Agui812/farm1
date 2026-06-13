const api = require('utils/api.js');
const util = require('utils/util.js');

App({
  globalData: {
    userInfo: null,
    openid: null,
    cart: [],
    addresses: [],
    config: null
  },

  onLaunch() {
    const cart = wx.getStorageSync('cart') || [];
    const addresses = wx.getStorageSync('addresses') || [];
    const userInfo = wx.getStorageSync('userInfo') || null;
    this.globalData.cart = cart;
    this.globalData.addresses = addresses;
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.openid = userInfo.openid;
    }
  },

  clearUserData() {
    this.globalData.openid = null;
    this.globalData.userInfo = null;
    this.globalData.addresses = [];
    wx.removeStorageSync('openid');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('addresses');
  },

  async login() {
    try {
      const res = await new Promise((resolve, reject) => {
        wx.login({
          success: res => resolve(res),
          fail: reject
        });
      });

      if (res.code) {
        const loginResult = await api.login(res.code);
        if (loginResult) {
          this.globalData.userInfo = loginResult;
          this.globalData.openid = loginResult.openid;
        }
      }
    } catch (err) {
      console.log('Login failed:', err);
    }
  },

  async getConfig() {
    try {
      const config = await api.getConfigAll();
      this.globalData.config = config;
      return config;
    } catch (err) {
      console.log('Get config failed:', err);
      return null;
    }
  },

  async getBanners() {
    try {
      return await api.getBannerAllList();
    } catch (err) {
      console.log('Get banners failed:', err);
      return [];
    }
  },

  async getCategories() {
    try {
      return await api.getCategoryAllList();
    } catch (err) {
      console.log('Get categories failed:', err);
      return [];
    }
  },

  async getProducts(status = 1) {
    try {
      return await api.getProducts(status);
    } catch (err) {
      console.log('Get products failed:', err);
      return [];
    }
  },

  async getProductsWithMinPrice() {
    try {
      return await api.getProductsWithMinPrice();
    } catch (err) {
      console.log('Get products with min price failed:', err);
      return [];
    }
  },

  async getProductById(id) {
    try {
      return await api.getProductById(id);
    } catch (err) {
      console.log('Get product failed:', err);
      return null;
    }
  },

  async getProductSkuList(productId) {
    try {
      return await api.getProductSkuList(productId);
    } catch (err) {
      console.log('Get product SKU list failed:', err);
      return [];
    }
  },

  async getAddresses() {
    if (!this.globalData.openid) return [];
    try {
      const userRes = await api.getUserByOpenid(this.globalData.openid);
      if (!userRes) {
        this.clearUserData();
        return [];
      }
      const addresses = await api.getAddressByUserId(userRes.id);
      this.globalData.addresses = addresses;
      wx.setStorageSync('addresses', addresses);
      return addresses;
    } catch (err) {
      if (err.code === 404) {
        this.clearUserData();
      }
      return [];
    }
  },

  async createAddress(data) {
    if (!this.globalData.openid) {
      wx.showToast({ title: '用户未登录', icon: 'none' });
      return Promise.reject(new Error('用户未登录'));
    }
    try {
      const userRes = await api.getUserByOpenid(this.globalData.openid);
      if (!userRes) {
        wx.showToast({ title: '用户信息获取失败', icon: 'none' });
        return Promise.reject(new Error('用户信息获取失败'));
      }
      const result = await api.createAddress({
        user_id: userRes.id,
        name: data.name,
        phone: data.phone,
        region: data.region,
        detail: data.detail,
        is_default: data.is_default || 0
      });
      await this.getAddresses();
      return result;
    } catch (err) {
      console.log('Create address failed:', err);
      throw err;
    }
  },

  async updateAddress(id, data) {
    try {
      const result = await api.updateAddress(id, {
        name: data.name,
        phone: data.phone,
        region: data.region,
        detail: data.detail,
        is_default: data.is_default || 0
      });
      await this.getAddresses();
      return result;
    } catch (err) {
      console.log('Update address failed:', err);
      return null;
    }
  },

  async deleteAddress(id) {
    try {
      const result = await api.deleteAddress(id);
      await this.getAddresses();
      return result;
    } catch (err) {
      console.log('Delete address failed:', err);
      return null;
    }
  },

  async getCartItems() {
    if (!this.globalData.openid) return [];
    try {
      const userRes = await api.getUserByOpenid(this.globalData.openid);
      if (!userRes) return [];
      return await api.getCartByUserId(userRes.id);
    } catch (err) {
      console.log('Get cart failed:', err);
      return [];
    }
  },

  async addToCart(productId, num = 1, skuId = null) {
    if (!this.globalData.openid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return null;
    }
    try {
      const userRes = await api.getUserByOpenid(this.globalData.openid);
      if (!userRes) return null;
      const result = await api.addToCart({
        user_id: userRes.id,
        product_id: productId,
        sku_id: skuId,
        num: num,
        is_checked: 1
      });
      return result;
    } catch (err) {
      console.log('Add to cart failed:', err);
      return null;
    }
  },

  async updateCartItem(id, data) {
    try {
      return await api.updateCart(id, data);
    } catch (err) {
      console.log('Update cart failed:', err);
      return null;
    }
  },

  async deleteCartItem(id) {
    try {
      return await api.deleteCart(id);
    } catch (err) {
      console.log('Delete cart failed:', err);
      return null;
    }
  },

  async createOrder(addressId, items, freight = 0, deliveryType = 1, isVip = false) {
    if (!this.globalData.openid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return null;
    }
    try {
      const userRes = await api.getUserByOpenid(this.globalData.openid);
      if (!userRes) {
        wx.showToast({ title: '用户信息失效，请重新登录', icon: 'none' });
        this.clearUserData();
        return null;
      }
      const safeFreight = parseFloat(freight) || 0;
      return await api.createOrder({
        user_id: userRes.id,
        address_id: addressId,
        items: JSON.stringify(items),
        freight: safeFreight,
        delivery_type: parseInt(deliveryType) || 1,
        is_vip: isVip ? 1 : 0
      });
    } catch (err) {
      if (err.code === 404) {
        wx.showToast({ title: '用户信息失效，请重新登录', icon: 'none' });
        this.clearUserData();
      } else {
        console.log('Create order failed:', err);
      }
      return null;
    }
  },

  async getOrders() {
    if (!this.globalData.openid) return [];
    try {
      const userRes = await api.getUserByOpenid(this.globalData.openid);
      if (!userRes) return [];
      return await api.getOrderByUserId(userRes.id);
    } catch (err) {
      console.log('Get orders failed:', err);
      return [];
    }
  },

  async getOrderById(id) {
    try {
      return await api.getOrderById(id);
    } catch (err) {
      console.log('Get order failed:', err);
      return null;
    }
  },

  async updateOrderStatus(id, orderStatus) {
    try {
      return await api.updateOrderStatus(id, orderStatus);
    } catch (err) {
      console.log('Update order status failed:', err);
      return null;
    }
  },

  async getPointExchangeOrders() {
    if (!this.globalData.openid) return [];
    try {
      const userRes = await api.getUserByOpenid(this.globalData.openid);
      if (!userRes) return [];
      return await api.getPointExchangeByUser(userRes.id);
    } catch (err) {
      console.log('Get point exchange orders failed:', err);
      return [];
    }
  },

  formatTime() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}:${s}`;
  },

  getCartTotal() {
    const cart = this.globalData.cart;
    const count = cart.reduce((sum, item) => sum + item.num, 0);
    return { count };
  }
});