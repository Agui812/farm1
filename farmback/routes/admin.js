const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/list', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, nickname, create_time, update_time FROM admin ORDER BY id ASC');
    rows.forEach(row => {
      delete row.password;
    });
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '账号密码不能为空' });
    }
    const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ code: 401, message: '账号不存在' });
    }
    const admin = rows[0];
    if (admin.password !== password) {
      return res.status(401).json({ code: 401, message: '密码错误' });
    }
    delete admin.password;
    res.json({ code: 0, message: '登录成功', data: admin });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    if (!username || !password) {
      return res.status(400).json({ code: 400, message: '账号和密码不能为空' });
    }
    const [exist] = await pool.query('SELECT id FROM admin WHERE username = ?', [username]);
    if (exist.length > 0) {
      return res.status(400).json({ code: 400, message: '账号已存在' });
    }
    const [result] = await pool.query(
      'INSERT INTO admin (username, password, nickname) VALUES (?, ?, ?)',
      [username, password, nickname || '管理员']
    );
    res.json({ code: 0, message: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { password, nickname } = req.body;
    const updates = [];
    const values = [];
    if (password) {
      updates.push('password = ?');
      values.push(password);
    }
    if (nickname !== undefined) {
      updates.push('nickname = ?');
      values.push(nickname);
    }
    if (updates.length === 0) {
      return res.status(400).json({ code: 400, message: '没有要更新的字段' });
    }
    values.push(req.params.id);
    await pool.query(`UPDATE admin SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id FROM admin WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ code: 404, message: '管理员不存在' });
    }
    await pool.query('DELETE FROM admin WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;