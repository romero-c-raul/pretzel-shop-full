const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../../server');
const { clearCart, teardown } = require('../helpers/db');

describe('Cart API', () => {
  let productId;      // fetched from real DB before tests run
  let sessionId;      // captured from response header after first POST

  before(async () => {
    // Fetch a real product ID so we don't hardcode data
    const res = await request(app).get('/api/products').expect(200);
    assert.ok(Array.isArray(res.body) && res.body.length > 0, 'products table must have at least one row');
    productId = res.body[0].id;
  });

  after(async () => {
    // Clean up the cart key we created, then close connections
    if (sessionId) await clearCart(sessionId);
    await teardown();
  });

  it('adds a product to the cart and returns the updated cart', async () => {
    const res = await request(app)
      .post('/api/cart')
      .send({ productId, quantity: 2 })
      .expect('Content-Type', /json/)
      .expect(200);

    // Capture session so GET and cleanup can reuse it
    sessionId = res.headers['x-session-id'];
    assert.ok(sessionId, 'response must include X-Session-Id header');

    assert.ok(Array.isArray(res.body), 'response body must be an array');
    const added = res.body.find(item => item.id === productId);
    assert.ok(added, 'added product must appear in cart response');
    assert.equal(added.quantity, 2);
  });

  it('retrieves the cart with the same session and finds the item', async () => {
    assert.ok(sessionId, 'sessionId must be set by the previous test');

    const res = await request(app)
      .get('/api/cart')
      .set('X-Session-Id', sessionId)
      .expect('Content-Type', /json/)
      .expect(200);

    assert.ok(Array.isArray(res.body), 'response body must be an array');
    const item = res.body.find(i => i.id === productId);
    assert.ok(item, 'previously added product must be in retrieved cart');
    assert.equal(item.quantity, 2);
  });

  // Failure: missing productId
  it('returns 400 when productId is missing', async () => {
    const res = await request(app)
      .post('/api/cart')
      .send({ quantity: 1 })
      .expect('Content-Type', /json/)
      .expect(400);

    assert.ok(res.body.error, 'error field must be present');
  });

  // Failure: invalid quantity
  it('returns 400 when quantity is zero', async () => {
    const res = await request(app)
      .post('/api/cart')
      .send({ productId, quantity: 0 })
      .expect('Content-Type', /json/)
      .expect(400);

    assert.ok(res.body.error, 'error field must be present');
  });
});
