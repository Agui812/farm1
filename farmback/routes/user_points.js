const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM user_points WHERE user_id = ? ORDER BY create_time DESC',
      [req.params.userId]
    );
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/user/:userId/total', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT total_points FROM user_points WHERE user_id = ? ORDER BY create_time DESC LIMIT 1',
      [req.params.userId]
    );
    const totalPoints = rows.length > 0 ? rows[0].total_points : 0;
    res.json({ code: 0, message: 'OK', data: { user_id: req.params.userId, total_points: totalPoints } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { user_id, points, type, remark } = req.body;
    if (!user_id || points === undefined || !type) {
      throw new Error('用户ID、积分变动、积分类型不能为空');
    }

    const [currentRows] = await conn.query(
      'SELECT total_points FROM user_points WHERE user_id = ? ORDER BY create_time DESC LIMIT 1 FOR UPDATE',
      [user_id]
    );
    const currentTotal = currentRows.length > 0 ? currentRows[0].total_points : 0;
    const newTotal = currentTotal + parseInt(points);

    if (newTotal < 0) {
      throw new Error('积分不足');
    }

    await conn.query(
      'INSERT INTO user_points (user_id, points, total_points, type, remark) VALUES (?, ?, ?, ?, ?)',
      [user_id, points, newTotal, type, remark || '']
    );

    await conn.commit();
    res.json({ code: 0, message: '积分变动成功', data: { user_id, points, total_points: newTotal } });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ code: 500, message: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
