const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/banner'));
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'banner_' + Date.now() + ext);
  }
});

const upload = multer({ storage });

router.get('/all/list', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banner ORDER BY sort ASC, id DESC');
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banner WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.json({ code: 404, message: '轮播图不存在' });
    }
    res.json({ code: 0, message: 'OK', data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const image = req.file ? '/uploads/banner/' + req.file.filename : req.body.image;
    const { title, sort, status } = req.body;
    if (!image) {
      return res.status(400).json({ code: 400, message: '图片不能为空' });
    }
    const [result] = await pool.query(
      'INSERT INTO banner (title, image, sort, status) VALUES (?, ?, ?, ?)',
      [title || '', image, sort || 0, status || 1]
    );
    res.json({ code: 0, message: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const image = req.file ? '/uploads/banner/' + req.file.filename : req.body.image;
    const { title, sort, status } = req.body;
    await pool.query(
      'UPDATE banner SET title = ?, image = ?, sort = ?, status = ? WHERE id = ?',
      [title || '', image || '', sort || 0, status || 1, req.params.id]
    );
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM banner WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;