const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM config');
    const config = {};
    rows.forEach(row => {
      config[row.config_key] = row.config_value;
    });
    res.json({ code: 0, message: 'OK', data: config });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM config WHERE config_key = ?', [req.params.key]);
    if (rows.length === 0) {
      return res.json({ code: 404, message: '配置不存在' });
    }
    res.json({ code: 0, message: 'OK', data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { config_key, config_value, remark } = req.body;
    const [result] = await pool.query(
      'INSERT INTO config (config_key, config_value, remark) VALUES (?, ?, ?)',
      [config_key, config_value, remark || '']
    );
    res.json({ code: 0, message: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:key', async (req, res) => {
  try {
    const { config_value, remark } = req.body;
    await pool.query(
      'UPDATE config SET config_value = ?, remark = ? WHERE config_key = ?',
      [config_value, remark || '', req.params.key]
    );
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;