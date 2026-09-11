import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Public API', () => {
  it('GET /api/v1/public/content should return content structures', async () => {
    const response = await request(app).get('/api/v1/public/content');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('site');
    expect(response.body.data).toHaveProperty('artist');
    expect(response.body.data).toHaveProperty('quotes');
    expect(response.body.data).toHaveProperty('artworks');
    expect(response.body.data).toHaveProperty('journey');
    expect(response.body.data).toHaveProperty('music');
    expect(response.body.data).toHaveProperty('contact');
  });

  it('POST /api/v1/public/letters with valid data should return 201', async () => {
    const response = await request(app)
      .post('/api/v1/public/letters')
      .send({
        name: 'Test User',
        email: 'test@user.com',
        message: 'Hello World'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('POST /api/v1/public/letters with invalid data should return 422', async () => {
    const response = await request(app)
      .post('/api/v1/public/letters')
      .send({
        name: '', // Invalid empty name
        email: 'not-an-email',
        message: 'Hello'
      });

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
  });
});

