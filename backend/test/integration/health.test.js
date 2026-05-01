const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { app } = require('../../server');
const { teardown } = require('../helpers/db');

describe('GET /health', () => {
  after(teardown);

  it('returns 200 with status ok', async () => {
    const res = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    assert.equal(res.body.status, 'ok');
  });
});
