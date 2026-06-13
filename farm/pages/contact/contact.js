const app = getApp();

Page({
  data: {},

  callPhone() {
    wx.showModal({
      title: '联系电话',
      content: '138-8888-8888',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: '13888888888' });
        }
      }
    });
  },

  copyWechat() {
    wx.showModal({
      title: '复制微信号',
      content: '微信号：aimengnongchang',
      confirmText: '复制',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'aimengnongchang',
            success: () => {
              wx.showToast({ title: '已复制', icon: 'success' });
            }
          });
        }
      }
    });
  },

  openMap() {
    wx.showModal({
      title: '农场地址',
      content: '黑龙江省五常市营城子乡\n点击确定将打开地图导航',
      confirmText: '导航',
      success: (res) => {
        if (res.confirm) {
          wx.openLocation({
            latitude: 44.5588,
            longitude: 127.1234,
            name: '艾萌农场',
            address: '黑龙江省五常市营城子乡',
            scale: 15
          });
        }
      }
    });
  }
});