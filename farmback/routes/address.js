const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM address WHERE user_id = ? ORDER BY is_default DESC, id DESC', [req.params.userId]);
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/all/list', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT a.*, u.nickname as user_nickname FROM address a LEFT JOIN user u ON a.user_id = u.id ORDER BY a.create_time DESC'
    );
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM address WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.json({ code: 404, message: '地址不存在' });
    }
    res.json({ code: 0, message: 'OK', data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, name, phone, region, detail, is_default } = req.body;
    if (is_default === 1) {
      await pool.query('UPDATE address SET is_default = 0 WHERE user_id = ?', [user_id]);
    }
    const [result] = await pool.query(
      'INSERT INTO address (user_id, name, phone, region, detail, is_default) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, name, phone, region, detail, is_default || 0]
    );
    res.json({ code: 0, message: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { user_id, name, phone, region, detail, is_default } = req.body;
    if (is_default === 1) {
      await pool.query('UPDATE address SET is_default = 0 WHERE user_id = ?', [user_id]);
    }
    await pool.query(
      'UPDATE address SET name = ?, phone = ?, region = ?, detail = ?, is_default = ? WHERE id = ?',
      [name, phone, region, detail, is_default || 0, req.params.id]
    );
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM address WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;