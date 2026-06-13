const app = getApp();

const areaData = require('../../../utils/area.js');

Page({
  data: {
    form: {
      name: '',
      phone: '',
      region: '',
      detail: '',
      is_default: 0
    },
    isEdit: false,
    editId: null,
    showAreaPicker: false,
    areaList: areaData,
    areaValue: '110101'
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        isEdit: true,
        editId: parseInt(options.id)
      });
      wx.setNavigationBarTitle({ title: '编辑地址' });
      this.loadAddress(options.id);
    } else {
      wx.setNavigationBarTitle({ title: '新增地址' });
    }
  },

  async loadAddress(id) {
    wx.showLoading({ title: '加载中...' });
    try {
      const addresses = await app.getAddresses();
      const address = addresses.find(a => a.id === parseInt(id));
      if (address) {
        this.setData({
          form: {
            name: address.name || '',
            phone: address.phone || '',
            region: address.region || '',
            detail: address.detail || '',
            is_default: address.is_default || 0
          }
        });
      }
    } catch (err) {
      console.error('Load address failed:', err);
      wx.showToast({ title: '加载地址失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  onFieldChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: e.detail
    });
  },

  onDefaultChange(e) {
    this.setData({
      'form.is_default': e.detail ? 1 : 0
    });
  },

  openAreaPicker() {
    this.setData({ showAreaPicker: true });
  },

  closeAreaPicker() {
    this.setData({ showAreaPicker: false });
  },

  onAreaConfirm(e) {
    const values = e.detail.values;
    if (values && values.length > 0) {
      const region = values.filter(v => v && v.name).map(v => v.name).join('');
      this.setData({
        'form.region': region,
        showAreaPicker: false
      });
    }
  },

  validatePhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },

  async saveAddress() {
    const { form, isEdit, editId } = this.data;

    if (!form.name || form.name.trim() === '') {
      wx.showToast({ title: '请输入收货人姓名', icon: 'none' });
      return;
    }

    if (!form.phone || form.phone.trim() === '') {
      wx.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }

    if (!this.validatePhone(form.phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }

    if (!form.region || form.region.trim() === '') {
      wx.showToast({ title: '请选择省市区', icon: 'none' });
      return;
    }

    if (!form.detail || form.detail.trim() === '') {
      wx.showToast({ title: '请输入详细地址', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      const saveData = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        region: form.region.trim(),
        detail: form.detail.trim(),
        is_default: form.is_default
      };

      let result;
      if (isEdit) {
        result = await app.updateAddress(editId, saveData);
      } else {
        result = await app.createAddress(saveData);
      }
      wx.hideLoading();
      if (!result) {
        wx.showToast({ title: '保存失败', icon: 'none' });
        return;
      }
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      wx.hideLoading();
      console.error('Save address failed:', err);
    }
  }
});