import bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Admin } from '../src/models/Admin.js';
import { JourneyMilestone } from '../src/models/JourneyMilestone.js';

const app = createApp();

describe('Journey Milestone Telescope API & Validation', () => {
  let authCookie;
  let csrfToken;

  beforeEach(async () => {
    await JourneyMilestone.deleteMany({});
    await Admin.deleteMany({});

    const passwordHash = await bcrypt.hash('adminSecret123', 10);
    await Admin.create({ email: 'admin@studio.com', passwordHash });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@studio.com', password: 'adminSecret123' });

    authCookie = loginRes.headers['set-cookie'];
    const csrfMatch = authCookie?.find((c) => c.includes('csrf_token'));
    csrfToken = csrfMatch ? csrfMatch.split(';')[0].split('=')[1] : '';
  });

  it('creates milestone with valid telescope metadata', async () => {
    const res = await request(app)
      .post('/api/v1/admin/journey')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        title: 'Starry Beginning',
        year: '2024',
        text: 'A quiet night under the stars.',
        image: {
          src: 'https://images.pexels.com/photos/16652946/pexels-photo-16652946.jpeg',
          alt: 'Stars',
        },
        order: 0,
        isPublished: true,
        telescope: {
          enabled: true,
          x: 25,
          y: 40,
          depth: 0.6,
          size: 'featured',
          glowColor: '#D4B3FF',
          constellationOrder: 1,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.telescope).toBeDefined();
    expect(res.body.data.telescope.x).toBe(25);
    expect(res.body.data.telescope.y).toBe(40);
    expect(res.body.data.telescope.size).toBe('featured');
    expect(res.body.data.telescope.glowColor).toBe('#D4B3FF');
  });

  it('rejects milestone with invalid x or y coordinates', async () => {
    const res = await request(app)
      .post('/api/v1/admin/journey')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        title: 'Too Far',
        year: '2024',
        telescope: {
          x: 150,
          y: -10,
        },
      });

    expect(res.status).toBe(422);
  });

  it('rejects milestone with invalid glowColor', async () => {
    const res = await request(app)
      .post('/api/v1/admin/journey')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        title: 'Bad Color',
        year: '2024',
        telescope: {
          glowColor: 'not-a-color',
        },
      });

    expect(res.status).toBe(422);
  });

  it('rejects milestone with invalid size enum', async () => {
    const res = await request(app)
      .post('/api/v1/admin/journey')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        title: 'Huge Star',
        year: '2024',
        telescope: {
          size: 'gigantic',
        },
      });

    expect(res.status).toBe(422);
  });

  it('updates telescope metadata on existing milestone', async () => {
    const m = await JourneyMilestone.create({
      title: 'Original',
      year: '2023',
      text: 'Early idea',
      order: 0,
      isPublished: true,
      telescope: { x: 10, y: 20, size: 'small' },
    });

    const res = await request(app)
      .patch(`/api/v1/admin/journey/${m._id}`)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        telescope: {
          x: 45,
          y: 65,
          size: 'featured',
          glowColor: '#BEE3F8',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.telescope.x).toBe(45);
    expect(res.body.data.telescope.y).toBe(65);
    expect(res.body.data.telescope.size).toBe('featured');
    expect(res.body.data.telescope.glowColor).toBe('#BEE3F8');
  });

  it('includes telescope metadata in public content endpoint', async () => {
    await JourneyMilestone.create({
      title: 'Public Star',
      year: '2025',
      text: 'Visible in telescope',
      order: 0,
      isPublished: true,
      telescope: {
        enabled: true,
        x: 55,
        y: 60,
        depth: 0.3,
        size: 'normal',
        glowColor: '#FFF2C6',
      },
    });

    const res = await request(app).get('/api/v1/public/content');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.journey).toBeInstanceOf(Array);
    const pubM = res.body.data.journey.find((j) => j.title === 'Public Star');
    expect(pubM).toBeDefined();
    expect(pubM.telescope).toBeDefined();
    expect(pubM.telescope.x).toBe(55);
    expect(pubM.telescope.y).toBe(60);
    expect(pubM.telescope.glowColor).toBe('#FFF2C6');
  });
});
