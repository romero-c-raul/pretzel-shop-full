const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, price, image, image_large as "imageLarge", image_thumb as "imageThumb", description, full_description as "fullDescription" FROM products ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id - Get a single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, price, image, image_large as "imageLarge", image_thumb as "imageThumb", description, full_description as "fullDescription" FROM products WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;

