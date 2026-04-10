const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const redisClient = require('../config/redis');

// Helper function to get cart key
const getCartKey = (sessionId) => `cart:${sessionId}`;

// POST /api/orders - Create a new order from checkout
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      fullName,
      email,
      address,
      city,
      zip,
      cartItems,
      sessionId
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !address || !city || !zip) {
      return res.status(400).json({ error: 'Missing required customer information' });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    await client.query('BEGIN');

    // Create customer record
    const customerResult = await client.query(
      `INSERT INTO customers (full_name, email, address, city, zip)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [fullName, email, address, city, zip]
    );
    const customerId = customerResult.rows[0].id;

    // Fetch product prices to calculate totals
    const productIds = cartItems.map(item => item.id);
    const productsResult = await client.query(
      'SELECT id, price FROM products WHERE id = ANY($1)',
      [productIds]
    );
    
    const productPriceMap = {};
    productsResult.rows.forEach(row => {
      productPriceMap[row.id] = parseFloat(row.price);
    });

    // Calculate subtotal
    let subtotal = 0;
    for (const item of cartItems) {
      const price = productPriceMap[item.id];
      if (!price) {
        throw new Error(`Product ${item.id} not found`);
      }
      subtotal += price * item.quantity;
    }

    const shippingCost = 5.00;
    const totalAmount = subtotal + shippingCost;

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, total_amount, shipping_cost, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [customerId, totalAmount, shippingCost, 'pending']
    );
    const orderId = orderResult.rows[0].id;

    // Create order items
    for (const item of cartItems) {
      const price = productPriceMap[item.id];
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.quantity, price]
      );
    }

    await client.query('COMMIT');

    // Clear cart from Redis if sessionId is provided
    if (sessionId) {
      const cartKey = getCartKey(sessionId);
      await redisClient.del(cartKey);
    }

    res.status(201).json({
      orderId,
      customerId,
      totalAmount,
      shippingCost,
      subtotal,
      message: 'Order created successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  } finally {
    client.release();
  }
});

// GET /api/orders/:id - Get order details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      `SELECT o.*, c.full_name, c.email, c.address, c.city, c.zip
       FROM orders o
       JOIN customers c ON o.customer_id = c.id
       WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT oi.*, p.name, p.image_thumb as "imageThumb"
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    res.json({
      ...order,
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;

