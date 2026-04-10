const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../config/redis');

// Helper function to get cart key
const getCartKey = (sessionId) => `cart:${sessionId}`;

// Helper function to get or create session ID
const getSessionId = (req, res) => {
  let sessionId = req.headers['x-session-id'];
  if (!sessionId) {
    sessionId = uuidv4();
  }
  // Always set the session ID in response header so frontend can persist it
  res.setHeader('X-Session-Id', sessionId);
  return sessionId;
};

// GET /api/cart - Get cart items
router.get('/', async (req, res) => {
  try {
    const sessionId = getSessionId(req, res);
    const cartKey = getCartKey(sessionId);
    
    const cartData = await redisClient.get(cartKey);
    
    if (!cartData) {
      return res.json([]);
    }

    let cart;
    try {
      cart = JSON.parse(cartData);
      // Normalize cart data - ensure IDs and quantities are numbers
      if (Array.isArray(cart)) {
        cart = cart.map(item => ({
          id: parseInt(item.id),
          quantity: parseInt(item.quantity)
        })).filter(item => !isNaN(item.id) && !isNaN(item.quantity));
      } else {
        console.warn('[Cart] Cart data is not an array, returning empty array');
        cart = [];
      }
    } catch (parseError) {
      console.error('[Cart] Failed to parse cart data:', parseError);
      return res.json([]);
    }
    
    res.json(cart);
  } catch (error) {
    console.error('[Cart] Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart - Add item to cart
router.post('/', async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    // Validate productId
    if (!productId && productId !== 0) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Validate quantity
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required (must be >= 1)' });
    }

    // Validate productId is a valid number
    const parsedProductId = parseInt(productId);
    if (isNaN(parsedProductId)) {
      return res.status(400).json({ error: 'Product ID must be a valid number' });
    }

    const sessionId = getSessionId(req, res);
    const cartKey = getCartKey(sessionId);
    
    console.log(`[Cart] Adding product ${parsedProductId} with quantity ${parsedQuantity} to cart for session ${sessionId}`);
    console.log(`[Cart] Request body:`, req.body);
    
    // Get current cart from Redis
    let cartData;
    try {
      cartData = await redisClient.get(cartKey);
    } catch (redisError) {
      console.error('[Cart] Redis get error:', redisError);
      throw new Error('Failed to retrieve cart from storage');
    }
    
    let cart = [];
    if (cartData) {
      try {
        cart = JSON.parse(cartData);
        // Ensure cart is an array and normalize item IDs to numbers
        if (!Array.isArray(cart)) {
          console.warn('[Cart] Cart data is not an array, resetting to empty array');
          cart = [];
        } else {
          // Normalize IDs to numbers for consistency
          cart = cart.map(item => ({
            id: parseInt(item.id),
            quantity: parseInt(item.quantity)
          })).filter(item => !isNaN(item.id) && !isNaN(item.quantity));
        }
      } catch (parseError) {
        console.error('[Cart] Failed to parse cart data:', parseError);
        cart = [];
      }
    }
    
    console.log(`[Cart] Current cart before adding (${cart.length} items):`, JSON.stringify(cart));
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === parsedProductId);
    
    if (existingItemIndex >= 0) {
      // Update quantity for existing item
      const oldQuantity = cart[existingItemIndex].quantity;
      cart[existingItemIndex].quantity += parsedQuantity;
      console.log(`[Cart] Updated existing item (ID: ${parsedProductId}) quantity from ${oldQuantity} to ${cart[existingItemIndex].quantity}`);
    } else {
      // Add new item - IMPORTANT: We push to the existing array, not replace it
      const newItem = {
        id: parsedProductId,
        quantity: parsedQuantity
      };
      cart.push(newItem);
      console.log(`[Cart] Added new item to cart (ID: ${parsedProductId}, Qty: ${parsedQuantity})`);
      console.log(`[Cart] Cart now has ${cart.length} item(s)`);
    }
    
    console.log(`[Cart] Cart after adding (${cart.length} items):`, JSON.stringify(cart));
    
    // Verify cart is still an array before saving
    if (!Array.isArray(cart)) {
      console.error('[Cart] ERROR: Cart is not an array before saving!', cart);
      throw new Error('Cart data corruption detected');
    }
    
    // Save to Redis with 24 hour expiration
    const cartJson = JSON.stringify(cart);
    try {
      await redisClient.setEx(cartKey, 86400, cartJson);
      console.log(`[Cart] Successfully saved cart to Redis (${cart.length} items)`);
      
      // Verify what was saved by reading it back
      const verifyData = await redisClient.get(cartKey);
      if (verifyData) {
        const verifyCart = JSON.parse(verifyData);
        console.log(`[Cart] Verification: Cart in Redis has ${verifyCart.length} item(s)`);
      }
    } catch (redisError) {
      console.error('[Cart] Redis setEx error:', redisError);
      throw new Error('Failed to save cart to storage');
    }
    
    // Return the updated cart
    res.json(cart);
  } catch (error) {
    console.error('[Cart] Error adding to cart:', error);
    const errorMessage = error.message || 'Failed to add item to cart';
    res.status(500).json({ error: errorMessage });
  }
});

// PUT /api/cart/:productId - Update cart item quantity
router.put('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const parsedProductId = parseInt(productId);
    if (isNaN(parsedProductId)) {
      return res.status(400).json({ error: 'Product ID must be a valid number' });
    }

    const sessionId = getSessionId(req, res);
    const cartKey = getCartKey(sessionId);
    
    const cartData = await redisClient.get(cartKey);
    if (!cartData) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    let cart;
    try {
      cart = JSON.parse(cartData);
      // Normalize cart data - ensure IDs and quantities are numbers
      if (!Array.isArray(cart)) {
        console.warn('[Cart] Cart data is not an array during update');
        return res.status(500).json({ error: 'Cart data is corrupted' });
      }
      cart = cart.map(item => ({
        id: parseInt(item.id),
        quantity: parseInt(item.quantity)
      })).filter(item => !isNaN(item.id) && !isNaN(item.quantity));
    } catch (parseError) {
      console.error('[Cart] Failed to parse cart data during update:', parseError);
      return res.status(500).json({ error: 'Failed to parse cart data' });
    }
    
    // Find and update item
    const itemIndex = cart.findIndex(item => item.id === parsedProductId);
    
    if (itemIndex < 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (parsedQuantity === 0) {
      // Remove item if quantity is 0
      cart.splice(itemIndex, 1);
      console.log(`[Cart] Removed item ${parsedProductId} from cart`);
    } else {
      cart[itemIndex].quantity = parsedQuantity;
      console.log(`[Cart] Updated item ${parsedProductId} quantity to ${parsedQuantity}`);
    }
    
    await redisClient.setEx(cartKey, 86400, JSON.stringify(cart));
    console.log(`[Cart] Cart after update has ${cart.length} item(s)`);
    
    res.json(cart);
  } catch (error) {
    console.error('[Cart] Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const parsedProductId = parseInt(productId);
    
    if (isNaN(parsedProductId)) {
      return res.status(400).json({ error: 'Product ID must be a valid number' });
    }

    const sessionId = getSessionId(req, res);
    const cartKey = getCartKey(sessionId);
    
    const cartData = await redisClient.get(cartKey);
    if (!cartData) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    let cart;
    try {
      cart = JSON.parse(cartData);
      // Normalize cart data
      if (!Array.isArray(cart)) {
        console.warn('[Cart] Cart data is not an array during delete');
        return res.status(500).json({ error: 'Cart data is corrupted' });
      }
      cart = cart.map(item => ({
        id: parseInt(item.id),
        quantity: parseInt(item.quantity)
      })).filter(item => !isNaN(item.id) && !isNaN(item.quantity));
    } catch (parseError) {
      console.error('[Cart] Failed to parse cart data during delete:', parseError);
      return res.status(500).json({ error: 'Failed to parse cart data' });
    }
    
    const initialLength = cart.length;
    cart = cart.filter(item => item.id !== parsedProductId);
    const removed = initialLength > cart.length;
    
    if (!removed) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }
    
    console.log(`[Cart] Removed item ${parsedProductId} from cart. Cart now has ${cart.length} item(s)`);
    await redisClient.setEx(cartKey, 86400, JSON.stringify(cart));
    
    res.json(cart);
  } catch (error) {
    console.error('[Cart] Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', async (req, res) => {
  try {
    const sessionId = getSessionId(req, res);
    const cartKey = getCartKey(sessionId);
    
    await redisClient.del(cartKey);
    
    res.json([]);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;

