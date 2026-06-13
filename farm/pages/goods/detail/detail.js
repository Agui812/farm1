const app = getApp();
const util = require('../../../utils/util.js');

Page({
  data: {
    goods: null,
    selectedSpec: '',
    cartCount: 0,
    images: [],
    showSkuPopup: false,
    popupType: 'cart',
    skuList: [],
    selectedSkuId: null,
    selectedSkuPrice: 0,
    selectedSkuStock: 0,
    buyNum: 1
  },

  onLoad(options) {
    const id = options.id;
    this.loadGoodsDetail(id);
  },

  onShow() {
    this.setData({
      cartCount: app.getCartTotal ? app.getCartTotal().count : 0
    });
  },

  checkLogin() {
    if (!app.globalData.openid) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' });
          }
        }
      });
      return false;
    }
    return true;
  },

  async loadGoodsDetail(id) {
    wx.showLoading({ title: '加载中...' });

    try {
      const goods = await app.getProductById(id);
      const skuRes = await app.getProductSkuList(id);

      if (goods) {
        goods.image = util.fixImageUrl(goods.image);
        let images = [];
        if (goods.images) {
          images = goods.images.split(',').filter(img => img).map(img => util.fixImageUrl(img));
        }
        if (!images.length && goods.image) {
          images = [util.fixImageUrl(goods.image)];
        }

        let skuList = [];
        let selectedSkuId = null;
        let minPrice = goods.min_price || 0;
        let selectedSkuPrice = minPrice;
        let selectedSkuStock = 999;

        if (skuRes && skuRes.length > 0) {
          skuList = skuRes.map(sku => ({
            id: sku.id,
            name: sku.sku_name,
            price: sku.price,
            stock: sku.stock,
            status: sku.status
          }));

          selectedSkuId = skuList[0].id;
          selectedSkuPrice = skuList[0].price;
          selectedSkuStock = skuList[0].stock;

          const allPrices = skuList.map(s => s.price).filter(p => p > 0);
          if (allPrices.length > 0) {
            minPrice = Math.min(...allPrices);
          }
        }

        this.setData({
          goods: goods,
          images: images,
          selectedSpec: goods.spec || '默认',
          skuList: skuList,
          selectedSkuId: selectedSkuId,
          selectedSkuPrice: selectedSkuPrice,
          selectedSkuStock: selectedSkuStock,
          minPrice: minPrice
        });
      }
    } catch (err) {
      console.error('Load goods detail failed:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  selectSpec(e) {
    const spec = e.currentTarget.dataset.spec;
    this.setData({ selectedSpec: spec });
  },

  showSkuPopup(e) {
    const type = e.currentTarget.dataset.type || 'cart';
    this.setData({
      showSkuPopup: true,
      popupType: type,
      buyNum: 1
    });
  },

  closeSkuPopup() {
    this.setData({
      showSkuPopup: false
    });
  },

  selectSku(e) {
    const skuId = e.currentTarget.dataset.id;
    const sku = this.data.skuList.find(s => String(s.id) === String(skuId));
    if (sku) {
      this.setData({
        selectedSkuId: sku.id,
        selectedSkuPrice: sku.price,
        selectedSkuStock: sku.stock
      });
    }
  },

  onNumChange(e) {
    this.setData({
      buyNum: e.detail
    });
  },

  async confirmAddCart() {
    if (!this.checkLogin()) return;
    const goods = this.data.goods;
    if (!goods) return;

    const skuId = this.data.selectedSkuId;

    try {
      const result = await app.addToCart(goods.id, this.data.buyNum, skuId);
      if (result) {
        wx.showToast({ title: '已加入购物车', icon: 'success' });
        this.setData({
          cartCount: app.getCartTotal().count,
          showSkuPopup: false
        });
        const tabBar = this.getTabBar();
        if (tabBar) tabBar.updateCartCount();
      }
    } catch (err) {
      console.error('Add to cart failed:', err);
      wx.showToast({ title: '加入失败', icon: 'none' });
    }
  },

  confirmBuyNow() {
    if (!this.checkLogin()) return;
    const goods = this.data.goods;
    if (!goods) return;

    const selectedSku = this.data.skuList.find(s => String(s.id) === String(this.data.selectedSkuId));

    const buyGoods = {
      id: goods.id,
      name: goods.name,
      price: this.data.selectedSkuPrice,
      sku_id: this.data.selectedSkuId,
      sku_name: selectedSku ? (selectedSku.sku_name || selectedSku.name) : '',
      image: goods.image,
      spec: this.data.selectedSpec,
      num: this.data.buyNum
    };

    this.setData({ showSkuPopup: false });
    wx.navigateTo({
      url: '/pages/order/confirm/confirm?goods=' + encodeURIComponent(JSON.stringify(buyGoods))
    });
  },

  buyNow() {
    const goods = this.data.goods;
    if (!goods) return;

    const buyGoods = {
      id: goods.id,
      name: goods.name,
      price: this.data.selectedSkuPrice,
      sku_id: this.data.selectedSkuId,
      sku_name: '',
      image: goods.image,
      spec: this.data.selectedSpec,
      num: 1
    };
    wx.navigateTo({
      url: '/pages/order/confirm/confirm?goods=' + encodeURIComponent(JSON.stringify(buyGoods))
    });
  },

  goToCart() {
    wx.switchTab({ url: '/pages/cart/cart' });
  },

  goToContact() {
    wx.navigateTo({ url: '/pages/contact/contact' });
  }
});