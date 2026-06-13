const app = getApp();
const util = require('../../../utils/util.js');

Page({
  data: {
    keyword: '',
    activeCategory: 'all',
    categoryId: '',
    goodsList: [],
    page: 1,
    pageSize: 10,
    loading: false,
    noMore: false
  },

  onLoad(options) {
    if (options.category) {
      this.setData({
        activeCategory: options.category,
        categoryId: options.category
      });
    }
    this.loadGoods();
  },

  onShow() {
    if (this.getTabBar) {
      const tabBar = this.getTabBar();
      if (tabBar) tabBar.setData({ selected: 1 });
    }
  },

  onSearchChange(e) {
    this.setData({ keyword: e.detail });
  },

  onSearch() {
    this.resetAndLoad();
  },

  onCategoryChange(e) {
    const category = e.detail.name;
    this.setData({
      activeCategory: category,
      categoryId: category
    });
    this.resetAndLoad();
  },

  resetAndLoad() {
    this.setData({
      page: 1,
      goodsList: [],
      noMore: false
    });
    this.loadGoods();
  },

  async loadGoods() {
    if (this.data.loading || this.data.noMore) return;

    this.setData({ loading: true });

    try {
      let products = await app.getProductsWithMinPrice();

      if (this.data.categoryId && this.data.categoryId !== 'all') {
        products = products.filter(p => p.category_id === this.data.categoryId);
      }

      if (this.data.keyword) {
        const kw = this.data.keyword.toLowerCase();
        products = products.filter(p =>
          p.name.toLowerCase().includes(kw) ||
          (p.desc && p.desc.toLowerCase().includes(kw))
        );
      }

      const start = (this.data.page - 1) * this.data.pageSize;
      const end = start + this.data.pageSize;
      const list = products.slice(start, end);

      this.setData({
        goodsList: [...this.data.goodsList, ...util.fixImageUrls(list)],
        page: this.data.page + 1,
        loading: false,
        noMore: end >= products.length
      });
    } catch (err) {
      console.error('Load goods failed:', err);
      this.setData({ loading: false });
    }
  },

  loadMore() {
    this.loadGoods();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/goods/detail/detail?id=${id}`
    });
  },

  async quickAdd(e) {
    e.stopPropagation();
    const id = e.currentTarget.dataset.id;
    const result = await app.addToCart(id, 1);
    if (result) {
      wx.showToast({ title: '已加入购物车', icon: 'success' });
      const tabBar = this.getTabBar();
      if (tabBar) tabBar.updateCartCount();
    }
  }
});