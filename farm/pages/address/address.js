const app = getApp();

Page({
  data: {
    addresses: []
  },

  onShow() {
    this.loadAddresses();
  },

  async loadAddresses() {
    try {
      const addresses = await app.getAddresses();
      this.setData({ addresses });
    } catch (err) {
      console.error('Load addresses failed:', err);
      wx.showToast({ title: '加载地址失败', icon: 'none' });
    }
  },

  selectAddress(e) {
    const id = e.currentTarget.dataset.id;
    const address = this.data.addresses.find(a => a.id === id);
    if (address) {
      this.data.addresses.forEach(a => a.is_default = 0);
      address.is_default = 1;
      app.globalData.addresses = this.data.addresses;
      wx.navigateBack();
    }
  },

  addAddress() {
    wx.navigateTo({
      url: '/pages/address/add/add'
    });
  },

  editAddress(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/address/add/add?id=' + id
    });
  },

  async deleteAddress(e) {
    const id = e.currentTarget.dataset.id;

    wx.showModal({
      title: '提示',
      content: '确定删除该地址？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await app.deleteAddress(id);
            await this.loadAddresses();
            wx.showToast({ title: '已删除', icon: 'success' });
          } catch (err) {
            console.error('Delete address failed:', err);
          }
        }
      }
    });
  }
});