const app = getApp();
const util = require('../../utils/util.js');

Page({
  data: {
    cartList: [],
    selectedIds: [],
    isAllSelected: false,
    totalPrice: 0,
    selectedCount: 0,
    loading: false,
    recommendList: []
  },

  onShow() {
    this.loadCart();
    if (this.getTabBar) {
      const tabBar = this.getTabBar();
      if (tabBar) tabBar.setData({ selected: 2 });
    }
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

  async loadCart() {
    this.setData({ loading: true });

    try {
      const cartItems = await app.getCartItems();

      const productIds = [...new Set(cartItems.map(item => item.product_id))];
      const productMap = {};
      const skuPromises = {};

      for (const id of productIds) {
        const product = await app.getProductById(id);
        if (product) {
          productMap[id] = product;
          skuPromises[id] = app.getProductSkuList(id);
        }
      }

      const skuResults = await Promise.all(Object.values(skuPromises));
      const skuMap = {};
      Object.keys(skuPromises).forEach((id, index) => {
        skuMap[id] = skuResults[index] || [];
      });

      const cartList = cartItems.map(item => {
        const product = productMap[item.product_id];
        const skuList = skuMap[item.product_id] || [];
        let price = item.product_price;
        let sku_name = item.sku_name || item.spec || '默认规格';

        if ((!price || price === 0) && product) {
          price = product.min_price || product.price || 0;
        }

        if (item.sku_id && skuList.length > 0) {
          const selectedSku = skuList.find(s => String(s.id) === String(item.sku_id));
          if (selectedSku) {
            sku_name = selectedSku.sku_name || selectedSku.name || sku_name;
          }
        }

        const isChecked = String(item.is_checked) === '1';

        return {
          id: String(item.id),
          product_id: item.product_id,
          sku_id: item.sku_id,
          sku_name: sku_name,
          name: item.product_name,
          price: parseFloat(price) || 0,
          image: util.fixImageUrl(item.product_image || (product ? product.image : '')),
          num: parseInt(item.num) || 1,
          checked: isChecked,
          selected: isChecked
        };
      });

      const selectedIds = cartList.filter(c => c.checked).map(c => c.id);

      this.setData({
        cartList,
        selectedIds: selectedIds,
        isAllSelected: selectedIds.length === cartList.length && cartList.length > 0,
        selectedCount: selectedIds.length
      });

      this.calculateTotal();

      if (cartList.length === 0) {
        this.loadRecommend();
      }
    } catch (err) {
      console.error('Load cart failed:', err);
      wx.showToast({ title: '加载购物车失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadRecommend() {
    try {
      const products = await app.getProductsWithMinPrice();
      const recommendList = products.slice(0, 6).map(p => ({
        id: p.id,
        name: p.name,
        price: p.min_price || p.price,
        original_price: p.original_price,
        image: util.fixImageUrl(p.image),
        description: p.description || '优质农产品，源自天然农场',
        is_recommend: p.is_recommend || p.is_hot
      }));
      this.setData({ recommendList });
    } catch (err) {
      console.error('Load recommend failed:', err);
    }
  },

  onCheckboxTap(e) {
    const index = e.currentTarget.dataset.index;
    const cartList = this.data.cartList.map((item, i) => {
      if (i === index) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });

    const selectedIds = cartList.filter(c => c.selected).map(c => c.id);
    const isAllSelected = selectedIds.length === cartList.length;

    this.setData({
      cartList,
      selectedIds,
      isAllSelected
    }, () => {
      this.calculateTotal();
    });
  },

  onItemTap(e) {
    const id = String(e.currentTarget.dataset.id);
    const selectedIds = this.data.selectedIds;
    const isSelected = selectedIds.includes(id);
    let newSelectedIds;

    if (isSelected) {
      newSelectedIds = selectedIds.filter(sid => sid !== id);
    } else {
      newSelectedIds = [...selectedIds, id];
    }

    const isAllSelected = newSelectedIds.length === this.data.cartList.length;

    this.setData({
      selectedIds: newSelectedIds,
      isAllSelected
    }, () => {
      this.calculateTotal();
    });
  },

  updateSelectedCount() {
    const selectedCount = this.data.selectedIds.length;
    this.setData({ selectedCount });
  },

  onSelectChange(e) {
    const selectedIds = e.detail;
    const cartList = this.data.cartList;

    this.setData({
      selectedIds,
      isAllSelected: selectedIds.length === cartList.length,
      selectedCount: selectedIds.length
    }, () => {
      this.calculateTotal();
    });
  },

  toggleSelectAll() {
    const isAllSelected = !this.data.isAllSelected;
    const cartList = this.data.cartList.map(item => ({
      ...item,
      selected: isAllSelected
    }));
    const selectedIds = isAllSelected ? cartList.map(c => c.id) : [];

    this.setData({
      cartList,
      isAllSelected,
      selectedIds,
      selectedCount: isAllSelected ? cartList.length : 0
    }, () => {
      this.calculateTotal();
    });

    cartList.forEach(async item => {
      await app.updateCartItem(item.id, { is_checked: isAllSelected ? 1 : 0 });
    });
  },

  async onNumChange(e) {
    const id = e.currentTarget.dataset.id;
    const num = e.detail;

    try {
      await app.updateCartItem(id, { num });
      this.loadCart();
    } catch (err) {
      console.error('Update cart failed:', err);
    }
  },

  async deleteItem(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确定删除该商品？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.deleteCartItem(id);
            this.loadCart();
            const tabBar = this.getTabBar();
            if (tabBar) tabBar.updateCartCount();
          } catch (err) {
            console.error('Delete cart failed:', err);
          }
        }
      }
    });
  },

  clearCart() {
    wx.showModal({
      title: '提示',
      content: '确定清空购物车？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const cartList = this.data.cartList;
            for (const item of cartList) {
              await app.deleteCartItem(item.id);
            }
            this.loadCart();
            const tabBar = this.getTabBar();
            if (tabBar) tabBar.updateCartCount();
          } catch (err) {
            console.error('Clear cart failed:', err);
          }
        }
      }
    });
  },

  calculateTotal() {
    const { cartList } = this.data;
    const selectedCart = cartList.filter(c => c.selected === true);
    const totalPrice = selectedCart.reduce((sum, c) => {
      const price = parseFloat(c.price) || 0;
      const num = parseInt(c.num) || 1;
      return sum + price * num;
    }, 0);
    this.setData({ totalPrice: totalPrice.toFixed(2) });
  },

  settle() {
    if (!this.checkLogin()) return;
    const selectedCart = this.data.cartList.filter(c => c.selected);
    if (selectedCart.length === 0) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }
    const items = selectedCart.map(c => ({
      id: c.product_id,
      product_id: c.product_id,
      sku_id: c.sku_id,
      name: c.name,
      price: c.price,
      image: c.image,
      sku_name: c.sku_name,
      num: c.num
    }));
    wx.navigateTo({
      url: '/pages/order/confirm/confirm?items=' + encodeURIComponent(JSON.stringify(items))
    });
  },

  goShopping() {
    wx.switchTab({ url: '/pages/goods/list/list' });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/goods/detail/detail?id=' + id
    });
  },

  async addToCart(e) {
    const item = e.currentTarget.dataset.item;
    try {
      await app.addToCart(item.id, 1);
      wx.showToast({ title: '已加入购物车', icon: 'success' });
    } catch (err) {
      console.error('Add to cart failed:', err);
      wx.showToast({ title: '加入失败', icon: 'none' });
    }
  }
});