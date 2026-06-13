const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const addressRoutes = require('./routes/address');
const orderRoutes = require('./routes/order');
const configRoutes = require('./routes/config');
const categoryRoutes = require('./routes/category');
const bannerRoutes = require('./routes/banner');
const cartRoutes = require('./routes/cart');
const productSkuRoutes = require('./routes/product_sku');
const userPointsRoutes = require('./routes/user_points');
const pointGoodsRoutes = require('./routes/point_goods');
const pointExchangeRoutes = require('./routes/point_exchange');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());

app.use((req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }
  if (req.get('content-type') === 'application/json') {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      if (data === 'null' || data === 'undefined' || data === '') {
        req.body = {};
      } else {
        try {
          req.body = JSON.parse(data);
        } catch (e) {
          req.body = {};
        }
      }
      next();
    });
  } else {
    next();
  }
});

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/config', configRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/product-sku', productSkuRoutes);
app.use('/api/user-points', userPointsRoutes);
app.use('/api/point-goods', pointGoodsRoutes);
app.use('/api/point-exchange', pointExchangeRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'OK' });
});

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
