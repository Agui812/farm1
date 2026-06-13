const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/all/list', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT c.*, u.nickname as user_nickname, p.name as product_name, p.image as product_image, ps.sku_name, ps.price as product_price FROM cart c LEFT JOIN user u ON c.user_id = u.id LEFT JOIN product p ON c.product_id = p.id LEFT JOIN product_sku ps ON c.sku_id = ps.id ORDER BY c.create_time DESC'
    );
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT c.*, p.name as product_name, p.image as product_image, ps.sku_name, ps.price as product_price FROM cart c LEFT JOIN product p ON c.product_id = p.id LEFT JOIN product_sku ps ON c.sku_id = ps.id WHERE c.user_id = ? ORDER BY c.create_time DESC',
      [req.params.userId]
    );
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, product_id, sku_id, num, is_checked } = req.body;
    if (!user_id || !product_id) {
      return res.status(400).json({ code: 400, message: '用户ID和商品ID不能为空' });
    }
    const [existing] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND sku_id = ?',
      [user_id, product_id, sku_id || null]
    );
    if (existing.length > 0) {
      await pool.query(
        'UPDATE cart SET num = num + ? WHERE user_id = ? AND product_id = ? AND sku_id = ?',
        [num || 1, user_id, product_id, sku_id || null]
      );
      return res.json({ code: 0, message: '购物车数量已更新' });
    }
    const [result] = await pool.query(
      'INSERT INTO cart (user_id, product_id, sku_id, num, is_checked) VALUES (?, ?, ?, ?, ?)',
      [user_id, product_id, sku_id || null, num || 1, is_checked || 1]
    );
    res.json({ code: 0, message: '添加成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { num, is_checked } = req.body;
    await pool.query(
      'UPDATE cart SET num = ?, is_checked = ? WHERE id = ?',
      [num, is_checked !== undefined ? is_checked : 1, req.params.id]
    );
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    console.log('DELETE cart/:id', req.params.id);
    await pool.query('DELETE FROM cart WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    console.error('DELETE cart error:', err);
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports =router;