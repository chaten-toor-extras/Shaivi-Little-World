import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Security Checks', () => {
  it('GET /api/v1/admin/site should be blocked without auth', async () => {
    const res = await request(app).get('/api/v1/admin/site');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/admin/letters should be blocked without auth', async () => {
    const res = await request(app).get('/api/v1/admin/letters');
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/admin/artworks should be blocked without auth', async () => {
    const res = await request(app)
      .post('/api/v1/admin/artworks')
      .send({ title: 'Hacked' });
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/public/content should not leak passwordHash or admin data', async () => {
    const res = await request(app).get('/api/v1/public/content');
    expect(res.status).toBe(200);

    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toContain('passwordHash');
    expect(bodyStr).not.toContain('AdminSession');
    expect(bodyStr).not.toContain('jwt');
  });
});

