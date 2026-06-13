const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/all/list', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM category ORDER BY sort ASC, id DESC');
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM category WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.json({ code: 404, message: '分类不存在' });
    }
    res.json({ code: 0, message: 'OK', data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, image, sort, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO category (name, image, sort, status) VALUES (?, ?, ?, ?)',
      [name, image || '', sort || 0, status || 1]
    );
    res.json({ code: 0, message: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, image, sort, status } = req.body;
    await pool.query(
      'UPDATE category SET name = ?, image = ?, sort = ?, status = ? WHERE id = ?',
      [name, image || '', sort || 0, status || 1, req.params.id]
    );
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM category WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;