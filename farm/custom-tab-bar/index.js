const app = getApp();

Component({
  data: {
    selected: 0,
    cartCount: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconPath: 'home-o',
        selectedIconPath: 'home-o'
      },
      {
        pagePath: '/pages/goods/list/list',
        text: '产品',
        iconPath: 'shop-o',
        selectedIconPath: 'shop-o'
      },
      {
        pagePath: '/pages/cart/cart',
        text: '购物车',
        iconPath: 'shopping-cart-o',
        selectedIconPath: 'shopping-cart-o'
      },
      {
        pagePath: '/pages/user/user',
        text: '我的',
        iconPath: 'user-o',
        selectedIconPath: 'user-o'
      }
    ]
  },

  attached() {
    this.updateCartCount();
  },

  methods: {
    switchTab(e) {
      const index = e.currentTarget.dataset.index;
      const path = e.currentTarget.dataset.path;
      this.setData({ selected: index });
      wx.switchTab({ url: path });
    },

    updateCartCount() {
      const cartCount = app.getCartTotal ? app.getCartTotal().count : 0;
      this.setData({ cartCount });
    }
  }
});