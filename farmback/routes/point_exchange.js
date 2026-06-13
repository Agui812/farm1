const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/all/list', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT peo.*, pg.name as goods_name, pg.image as goods_image, pg.points as goods_points,
             u.nickname as user_nickname, u.phone as user_phone
      FROM point_exchange_order peo
      LEFT JOIN point_goods pg ON peo.goods_id = pg.id
      LEFT JOIN user u ON peo.user_id = u.id
      ORDER BY peo.create_time DESC
    `);
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT peo.*, pg.name as goods_name, pg.image as goods_image, pg.points as goods_points
      FROM point_exchange_order peo
      LEFT JOIN point_goods pg ON peo.goods_id = pg.id
      WHERE peo.user_id = ?
      ORDER BY peo.create_time DESC
    `, [req.params.userId]);
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { user_id, goods_id, address_id, num } = req.body;
    if (!user_id || !goods_id) {
      throw new Error('用户ID和商品ID不能为空');
    }

    const [goodsRows] = await conn.query('SELECT * FROM point_goods WHERE id = ?', [goods_id]);
    if (goodsRows.length === 0) {
      throw new Error('积分商品不存在');
    }
    const goods = goodsRows[0];
    if (goods.status !== 1) {
      throw new Error('该商品已下架');
    }

    const realPoints = parseInt(goods.points) || 0;
    const realNum = parseInt(num) || 1;
    const totalPoints = realPoints * realNum;

    if (goods.stock < realNum) {
      throw new Error('库存不足');
    }

    const [currentRows] = await conn.query(
      'SELECT total_points FROM user_points WHERE user_id = ? ORDER BY create_time DESC LIMIT 1 FOR UPDATE',
      [user_id]
    );
    const currentTotal = currentRows.length > 0 ? currentRows[0].total_points : 0;
    if (currentTotal < totalPoints) {
      throw new Error('积分不足');
    }

    const newTotal = currentTotal - totalPoints;

    await conn.query(
      'INSERT INTO user_points (user_id, points, total_points, type, remark) VALUES (?, ?, ?, ?, ?)',
      [user_id, -totalPoints, newTotal, 'exchange', `兑换${goods.name}x${realNum}`]
    );

    await conn.query(
      'UPDATE point_goods SET stock = stock - ? WHERE id = ?',
      [realNum, goods_id]
    );

    const orderNo = 'PE' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();

    const [orderResult] = await conn.query(
      'INSERT INTO point_exchange_order (order_no, user_id, goods_id, goods_name, goods_image, points, num, address_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [orderNo, user_id, goods_id, goods.name, goods.image, totalPoints, realNum, address_id || null, 1]
    );

    await conn.query(
      'INSERT INTO `order` (order_no, user_id, address_id, total_price, freight, real_price, pay_type, order_status, delivery_type, is_point_exchange, create_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [orderNo, user_id, address_id || null, totalPoints, 0, 0, 0, 1, 1, 1]
    );

    const [orderRows] = await conn.query('SELECT id FROM `order` WHERE order_no = ?', [orderNo]);
    const mainOrderId = orderRows[0].id;

    await conn.query(
      'INSERT INTO order_item (order_id, product_id, product_name, product_price, product_image, sku_name, num, total_price, total_points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [mainOrderId, goods_id, goods.name, 0, goods.image, '积分兑换', realNum, 0, totalPoints]
    );

    await conn.commit();
    res.json({
      code: 0,
      message: '兑换成功',
      data: {
        order_id: orderResult.insertId,
        order_no: orderNo,
        points_deducted: totalPoints,
        remaining_points: newTotal
      }
    });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ code: 500, message: err.message });
  } finally {
    conn.release();
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query(
      'UPDATE point_exchange_order SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
