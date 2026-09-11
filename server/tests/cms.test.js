import bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Admin } from '../src/models/Admin.js';

const app = createApp();

describe('CMS Admin Endpoints', () => {
  let authCookie;

  beforeEach(async () => {
    // Create admin
    const passwordHash = await bcrypt.hash('adminSecret123', 10);
    await Admin.create({ email: 'admin@studio.com', passwordHash });

    // Login to obtain auth cookies
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@studio.com', password: 'adminSecret123' });

    authCookie = loginRes.headers['set-cookie'];
  });

  describe('Quotes CRUD', () => {
    it('should create and retrieve a quote', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/v1/admin/quotes')
        .set('Cookie', authCookie)
        .set('x-csrf-token', 'test-bypass')
        .send({
          text: 'A quiet morning is the best beginning.',
          category: 'Morning thoughts',
          order: 0,
          isPublished: true,
        });

      // If csrf token check is active, note csrf cookie or mock
      if (createRes.status === 403) {
        // extract csrf cookie
        const csrfMatch = authCookie.find(c => c.includes('csrf_token'));
        const csrfToken = csrfMatch ? csrfMatch.split(';')[0].split('=')[1] : '';
        const retryRes = await request(app)
          .post('/api/v1/admin/quotes')
          .set('Cookie', authCookie)
          .set('x-csrf-token', csrfToken)
          .send({
            text: 'A quiet morning is the best beginning.',
            category: 'Morning thoughts',
            order: 0,
            isPublished: true,
          });
        expect(retryRes.status).toBe(201);
      } else {
        expect(createRes.status).toBe(201);
      }

      // List quotes
      const listRes = await request(app)
        .get('/api/v1/admin/quotes')
        .set('Cookie', authCookie);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Artworks CRUD', () => {
    it('should create an artwork', async () => {
      const csrfMatch = authCookie?.find(c => c.includes('csrf_token'));
      const csrfToken = csrfMatch ? csrfMatch.split(';')[0].split('=')[1] : '';

      const res = await request(app)
        .post('/api/v1/admin/artworks')
        .set('Cookie', authCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          title: 'Morning Sun',
          year: 2026,
          caption: 'Light across the table',
          image: {
            src: 'https://images.pexels.com/photos/16652946/pexels-photo-16652946.jpeg',
            alt: 'Morning sun',
          },
          order: 0,
          isPublished: true,
        });

      expect(res.status).toBe(201);
    });
  });

  describe('Dashboard Stats', () => {
    it('should return counts and flat statistics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('artworks');
      expect(res.body.data).toHaveProperty('quotes');
      expect(res.body.data).toHaveProperty('songs');
      expect(res.body.data).toHaveProperty('moods');
      expect(res.body.data).toHaveProperty('milestones');
      expect(res.body.data).toHaveProperty('unreadLetters');
      expect(res.body.data).toHaveProperty('totalLetters');
      expect(res.body.data).toHaveProperty('counts');
    });
  });

  describe('Media Signature', () => {
    it('should generate valid upload signature matching Cloudinary direct upload spec', async () => {
      const csrfMatch = authCookie?.find(c => c.includes('csrf_token'));
      const csrfToken = csrfMatch ? csrfMatch.split(';')[0].split('=')[1] : '';

      const res = await request(app)
        .post('/api/v1/admin/media/signature')
        .set('Cookie', authCookie)
        .set('x-csrf-token', csrfToken)
        .send({ folder: 'artist', resourceType: 'image' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('signature');
      expect(res.body.data).toHaveProperty('timestamp');
      expect(res.body.data).toHaveProperty('apiKey');
      expect(res.body.data.folder).toBe('artist');
    });
  });
});
