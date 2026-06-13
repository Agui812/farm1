const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/all/list', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM product_sku ORDER BY id DESC');
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM product_sku WHERE product_id = ? ORDER BY id ASC',
      [req.params.productId]
    );
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM product_sku WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '规格不存在' });
    }
    res.json({ code: 0, message: 'OK', data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { product_id, sku_name, price, stock, status } = req.body;
    if (!product_id || !sku_name || !price) {
      return res.status(400).json({ code: 400, message: '商品ID、规格名称、价格不能为空' });
    }
    const [result] = await pool.query(
      'INSERT INTO product_sku (product_id, sku_name, price, stock, status) VALUES (?, ?, ?, ?, ?)',
      [product_id, sku_name, price, stock || 0, status || 1]
    );
    res.json({ code: 0, message: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { product_id, sku_name, price, stock, status } = req.body;
    await pool.query(
      'UPDATE product_sku SET product_id = ?, sku_name = ?, price = ?, stock = ?, status = ? WHERE id = ?',
      [product_id, sku_name, price, stock, status, req.params.id]
    );
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM product_sku WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
