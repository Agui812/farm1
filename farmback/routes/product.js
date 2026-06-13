const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/product'));
  },
  filename: function(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'product_' + Date.now() + ext);
  }
});

const upload = multer({ storage });

router.get('/with-min-price', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, (SELECT MIN(ps.price) FROM product_sku ps WHERE ps.product_id = p.id) AS min_price FROM product p WHERE p.status = 1'
    );
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, cate_id } = req.query;
    let sql = 'SELECT p.*, (SELECT MIN(ps.price) FROM product_sku ps WHERE ps.product_id = p.id) AS min_price FROM product p WHERE 1=1';
    let params = [];
    if (status !== undefined) {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    if (cate_id !== undefined) {
      sql += ' AND p.cate_id = ?';
      params.push(cate_id);
    }
    sql += ' ORDER BY p.id DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 0, message: 'OK', data: rows });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT p.*, (SELECT MIN(ps.price) FROM product_sku ps WHERE ps.product_id = p.id) AS min_price FROM product p WHERE p.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.json({ code: 404, message: '商品不存在' });
    }
    res.json({ code: 0, message: 'OK', data: rows[0] });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
  try {
    const image = req.files?.image ? '/uploads/product/' + req.files.image[0].filename : req.body.image;
    const images = req.files?.images ? req.files.images.map(f => '/uploads/product/' + f.filename).join(',') : req.body.images;
    const { cate_id, name, desc, status } = req.body;
    if (!image) {
      return res.status(400).json({ code: 400, message: '图片不能为空' });
    }
    const [result] = await pool.query(
      'INSERT INTO product (cate_id, name, image, images, `desc`, status) VALUES (?, ?, ?, ?, ?, ?)',
      [cate_id || 0, name, image, images || '', desc || '', status || 1]
    );
    res.json({ code: 0, message: '创建成功', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'images', maxCount: 10 }]), async (req, res) => {
  try {
    const image = req.files?.image ? '/uploads/product/' + req.files.image[0].filename : req.body.image;
    const images = req.files?.images ? req.files.images.map(f => '/uploads/product/' + f.filename).join(',') : req.body.images;
    const { cate_id, name, desc, status } = req.body;
    await pool.query(
      'UPDATE product SET cate_id = ?, name = ?, image = ?, images = ?, `desc` = ?, status = ? WHERE id = ?',
      [cate_id || 0, name, image || '', images || '', desc || '', status, req.params.id]
    );
    res.json({ code: 0, message: '更新成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM product WHERE id = ?', [req.params.id]);
    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
