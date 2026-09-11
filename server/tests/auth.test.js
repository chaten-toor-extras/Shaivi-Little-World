import bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { env } from '../src/config/env.js';
import { Admin } from '../src/models/Admin.js';

const app = createApp();

describe('Auth API', () => {
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    await Admin.create({ email: 'test@admin.com', passwordHash });
  });

  it('POST /login with valid credentials should succeed', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@admin.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.admin.email).toBe('test@admin.com');
    // Check cookies
    const cookies = response.headers['set-cookie'];
    expect(cookies.some(c => c.includes(env.COOKIE_ACCESS_NAME))).toBe(true);
  });

  it('POST /login with wrong password should fail', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@admin.com', password: 'wrong' });

    expect(response.status).toBe(401);
  });

  it('GET /me without auth should return 401', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
  });
});

