const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const https = require('https');

router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ code: 400, message: 'code不能为空' });
    }
    const appId = process.env.WX_APPID;
    const appSecret = process.env.WX_APPSECRET;
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
    const wxData = await new Promise((resolve, reject) => {
      https.get(url, (resp) => {
        let data = '';
        resp.on('data', (chunk) => { data += chunk; });
        resp.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(e); }
        });
      }).on('error', (err) => reject(err));
    });
    if (wxData.errcode) {
      return res.status(400).json({ code: 400, message: wxData.errmsg || '微信登录失败' });
    }
    const { openid, session_key, unionid } = wxData;
    const [rows] = await pool.query('SELECT * FROM user WHERE openid = ?', [openid]);
    if (rows.length > 0) {
      return res.json({ code: 0, message: '登录成功', data: { ...rows[0], session_key } });
    }
    const [result] = await pool.query(
      'INSERT INTO user (openid, nickname, avatar, phone) VALUES (?, ?, ?, ?)',
      [openid, '微信用户', '', '']
    );
    const [newRows] = await pool.query('SELECT * FROM user WHERE id = ?', [result.insertId]);
    res.json({ code: 0, message: '登录成功', data: { ...newRows[0], session_key } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/all/list', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user ORDER BY create_time DESC');
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/openid/:openid', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user WHERE openid = ?', [req.params.openid]);
    if (rows.length === 0) {
      return res.json({ code: 404, message: '用户不存在' });
    }
    res.json({ code: 0, message: 'OK', data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.json({ code: 404, message: '用户不存在' });
    }
    res.json({ code: 0, message: 'OK', data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { openid, nickname, avatar, phone } = req.body;
    const [result] = await pool.query(
      'INSERT INTO user (openid, nickname, avatar, phone) VALUES (?, ?, ?, ?)',
      [openid, nickname || '', avatar || '', phone || '']
    );
    res.json({ code: 0, message: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nickname, avatar, phone, is_vip } = req.body;
    await pool.query(
      'UPDATE user SET nickname = ?, avatar = ?, phone = ?, is_vip = ? WHERE id = ?',
      [nickname, avatar, phone, is_vip, req.params.id]
    );
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;