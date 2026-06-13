const API_BASE = 'http://localhost:3000/api';

function request(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '加载中...' });
    console.log('API Request:', method, url, data);
    wx.request({
      url: API_BASE + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      success(res) {
        wx.hideLoading();
        console.log('API Response:', res.data);
        if (res.statusCode === 304) {
          reject({ code: 304, message: 'Not Modified' });
        } else if (res.data.code === 0) {
          resolve(res.data.data);
        } else {
          wx.showToast({ title: res.data.message || '请求失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail(err) {
        wx.hideLoading();
        wx.showToast({ title: '网络请求失败', icon: 'none' });
        reject(err);
      }
    });
  });
}

function get(url, params) {
  let queryString = '';
  if (params) {
    queryString = '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&');
  }
  return request(url + queryString);
}

function post(url, data) {
  return request(url, 'POST', data);
}

function put(url, data) {
  return request(url, 'PUT', data);
}

function del(url) {
  return request(url, 'DELETE');
}

module.exports = {
  API_BASE,

  getHealth: () => get('/health'),

  getUserAllList: () => get('/user/all/list'),
  getUserById: (id) => get(`/user/${id}`),
  getUserByOpenid: (openid) => get(`/user/openid/${openid}`),
  login: (code) => post('/user/login', { code }),
  createUser: (data) => post('/user', data),
  updateUser: (id, data) => put(`/user/${id}`, data),

  getProducts: (status) => get('/product', status ? { status } : null),
  getProductsWithMinPrice: () => get('/product/with-min-price'),
  getProductById: (id) => get(`/product/${id}`),
  getProductSkuList: (productId) => get(`/product-sku/product/${productId}`),
  createProduct: (data) => post('/product', data),
  updateProduct: (id, data) => put(`/product/${id}`, data),
  deleteProduct: (id) => del(`/product/${id}`),

  getAddressAllList: () => get('/address/all/list'),
  getAddressByUserId: (userId) => get(`/address/user/${userId}`),
  getAddressById: (id) => get(`/address/${id}`),
  createAddress: (data) => post('/address', data),
  updateAddress: (id, data) => put(`/address/${id}`, data),
  deleteAddress: (id) => del(`/address/${id}`),

  getOrderAll: () => get('/order/all'),
  getOrderByUserId: (userId) => get(`/order/user/${userId}`),
  getOrderById: (id) => get(`/order/${id}`),
  createOrder: (data) => post('/order', data),
  updateOrderStatus: (id, order_status) => put(`/order/${id}/status`, { order_status }),

  getCategoryAllList: () => get('/category/all/list'),
  getCategoryById: (id) => get(`/category/${id}`),
  createCategory: (data) => post('/category', data),
  updateCategory: (id, data) => put(`/category/${id}`, data),
  deleteCategory: (id) => del(`/category/${id}`),

  getBannerAllList: () => get('/banner/all/list'),
  getBannerById: (id) => get(`/banner/${id}`),
  createBanner: (data) => post('/banner', data),
  updateBanner: (id, data) => put(`/banner/${id}`, data),
  deleteBanner: (id) => del(`/banner/${id}`),

  getCartAllList: () => get('/cart/all/list'),
  getCartByUserId: (userId) => get(`/cart/user/${userId}`),
  addToCart: (data) => post('/cart', data),
  updateCart: (id, data) => put(`/cart/${id}`, data),
  deleteCart: (id) => del(`/cart/${id}`),

  getConfigAll: () => get('/config/all'),
  updateConfig: (key, config_value) => put(`/config/${key}`, { config_value }),

  getPointsHistory: (userId) => get(`/user-points/user/${userId}`),
  getPointsTotal: (userId) => get(`/user-points/user/${userId}/total`),
  addPoints: (data) => post('/user-points', data),

  getPointGoodsAll: () => get('/point-goods/all/list'),
  getPointGoodsById: (id) => get(`/point-goods/${id}`),

  getPointExchangeAll: () => get('/point-exchange/all/list'),
  getPointExchangeByUser: (userId) => get(`/point-exchange/user/${userId}`),
  createPointExchange: (data) => post('/point-exchange', data),
  updatePointExchangeStatus: (id, status) => put(`/point-exchange/${id}/status`, { status })
};