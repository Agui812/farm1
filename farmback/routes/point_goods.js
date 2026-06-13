const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/all/list', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM point_goods ORDER BY create_time DESC');
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM point_goods WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.json({ code: 404, message: '商品不存在' });
    }
    res.json({ code: 0, message: 'OK', data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, image, points, stock, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO point_goods (name, image, points, stock, status) VALUES (?, ?, ?, ?, ?)',
      [name, image, points || 0, stock || 0, status !== undefined ? status : 1]
    );
    res.json({ code: 0, message: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, image, points, stock, status } = req.body;
    await pool.query(
      'UPDATE point_goods SET name = ?, image = ?, points = ?, stock = ?, status = ? WHERE id = ?',
      [name, image, points, stock, status, req.params.id]
    );
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM point_goods WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
