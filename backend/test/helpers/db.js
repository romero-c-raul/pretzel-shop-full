// Shared test helpers for integration tests.
// Import pool and redisClient here so every test file can close them via
// the exported teardown() rather than managing connections individually.

const pool = require('../../config/database');
const redisClient = require('../../config/redis');

/**
 * Delete a cart key from Redis for a given session ID.
 * Call this in after()/afterEach() to keep tests isolated.
 */
async function clearCart(sessionId) {
  await redisClient.del(`cart:${sessionId}`);
}

/**
 * Close all shared connections. Call once in the outermost after() hook
 * of a test file so Node can exit cleanly.
 */
async function teardown() {
  await pool.end();
  if (redisClient.isOpen) await redisClient.quit();
}

module.exports = { clearCart, teardown };
