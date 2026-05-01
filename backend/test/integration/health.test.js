const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../../server');
const pool = require('../../config/database');
const redisClient = require('../../config/redis');

describe('GET /health', () => {
  after(async () => {
    await pool.end();
    if (redisClient.isOpen) await redisClient.quit();
  });

  it('returns 200 with status ok', async () => {
    const res = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    assert.equal(res.body.status, 'ok');
  });
});
