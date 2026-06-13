const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function generateOrderNo() {
  return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
}

router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM `order` WHERE user_id = ? ORDER BY create_time DESC',
      [req.params.userId]
    );
    for (let order of rows) {
      const [items] = await pool.query('SELECT * FROM order_item WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT o.*, u.nickname as user_nickname, u.phone as user_phone, a.name as address_name, a.phone as address_phone, a.region, a.detail FROM `order` o LEFT JOIN `user` u ON o.user_id = u.id LEFT JOIN `address` a ON o.address_id = a.id ORDER BY o.create_time DESC'
    );
    for (let order of rows) {
      const [items] = await pool.query('SELECT * FROM order_item WHERE order_id = ?', [order.id]);
      order.items = items;
    }
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM `order` WHERE id = ?', [req.params.id]);
    if (orders.length === 0) {
      return res.json({ code: 404, message: '订单不存在' });
    }
    const order = orders[0];
    const [items] = await pool.query('SELECT * FROM order_item WHERE order_id = ?', [order.id]);
    order.items = items;
    res.json({ code: 0, message: 'OK', data: order });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let { user_id, address_id, items, freight, delivery_type } = req.body;

    if (typeof items === 'string' && items !== 'null' && items !== 'undefined') {
      items = JSON.parse(items);
    }

    const [addressRows] = await conn.query('SELECT * FROM address WHERE id = ?', [address_id]);
    if (addressRows.length === 0) {
      throw new Error('收货地址不存在');
    }

    let totalPrice = 0;
    const itemsData = [];
    for (const item of items) {
      let itemPrice;
      let skuName = '';
      if (item.price) {
        itemPrice = parseFloat(item.price);
      } else if (item.sku_id) {
        const [skuRows] = await conn.query('SELECT price, sku_name FROM product_sku WHERE id = ?', [item.sku_id]);
        if (skuRows.length === 0) {
          throw new Error(`商品规格ID ${item.sku_id} 不存在`);
        }
        itemPrice = parseFloat(skuRows[0].price);
        skuName = skuRows[0].sku_name;
      } else {
        throw new Error(`商品ID ${item.product_id} 缺少价格信息`);
      }

      const [productRows] = await conn.query('SELECT * FROM product WHERE id = ?', [item.product_id]);
      if (productRows.length === 0) {
        throw new Error(`商品ID ${item.product_id} 不存在`);
      }
      const product = productRows[0];
      const itemTotal = itemPrice * item.num;
      totalPrice += itemTotal;
      itemsData.push({
        product_id: product.id,
        product_name: product.name,
        product_price: itemPrice,
        product_image: product.image,
        sku_name: skuName,
        num: item.num,
        total_price: itemTotal
      });
    }

    const freightFee = freight || 0;
    const realPrice = totalPrice + freightFee;

    const [configRows] = await conn.query('SELECT config_value FROM config WHERE config_key = ?', ['member_discount']);
    const discount = configRows.length > 0 ? parseFloat(configRows[0].config_value) : 0;
    const finalPrice = Math.max(0, realPrice - discount);

    const orderNo = generateOrderNo();
    const [orderResult] = await conn.query(
      'INSERT INTO `order` (order_no, user_id, address_id, total_price, freight, real_price, order_status, delivery_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [orderNo, user_id, address_id, totalPrice, freightFee, finalPrice, 1, delivery_type || 1]
    );
    const orderId = orderResult.insertId;

    for (const item of itemsData) {
      await conn.query(
        'INSERT INTO order_item (order_id, product_id, product_name, product_price, product_image, sku_name, num, total_price, total_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.product_name, item.product_price, item.product_image, item.sku_name, item.num, item.total_price, item.total_points || 0]
      );
    }

    await conn.commit();
    res.json({ code: 0, message: '创建成功', data: { id: orderId, order_no: orderNo, real_price: finalPrice } });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ code: 500, message: err.message });
  } finally {
    conn.release();
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { order_status } = req.body;
    const updates = { order_status };
    if (order_status === 2) updates.pay_time = new Date();
    if (order_status === 3) updates.delivery_time = new Date();
    if (order_status === 4) updates.finish_time = new Date();

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];
    await pool.query(`UPDATE \`order\` SET ${setClause} WHERE id = ?`, values);
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;