import bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Admin } from '../src/models/Admin.js';
import { Collectible } from '../src/models/Collectible.js';
import { Secret } from '../src/models/Secret.js';

const app = createApp();

describe('Collectibles Admin & Public Endpoints', () => {
  let authCookie;
  let csrfToken;

  beforeEach(async () => {
    await Collectible.deleteMany({});
    await Secret.deleteMany({});
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

  it('GET /api/v1/admin/collectibles requires authentication', async () => {
    const res = await request(app).get('/api/v1/admin/collectibles');
    expect(res.status).toBe(401);
  });

  it('creates collectible with valid anchor, modelKey, and category', async () => {
    const res = await request(app)
      .post('/api/v1/admin/collectibles')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        name: 'Little Star',
        slug: 'little-star',
        description: 'A tiny glowing star fragment.',
        hint: 'Where the water softly catches the sky.',
        category: 'STAR',
        rarity: 'COMMON',
        source: 'WORLD',
        model: {
          modelKey: 'tiny_star',
          scalePreset: 'NORMAL',
          rotationPreset: 'DEFAULT',
        },
        appearance: {
          glowColor: '#ffe8b2',
          accentColor: '#f7d070',
          idleAnimation: 'FLOAT',
          revealEffect: 'TINY_STARS',
        },
        placement: {
          anchor: 'POND_EDGE',
          offset: { x: 0.1, y: 0.05, z: 0.2 },
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('little-star');
    expect(res.body.data.placement.anchor).toBe('POND_EDGE');
    expect(res.body.data.source).toBe('WORLD');
  });

  it('rejects invalid anchor or category', async () => {
    const res = await request(app)
      .post('/api/v1/admin/collectibles')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        name: 'Bad Item',
        slug: 'bad-item',
        category: 'INVALID_CATEGORY',
        placement: {
          anchor: 'SOMEWHERE_ELSE',
        },
      });

    expect(res.status).toBe(422);
  });

  it('preserves immutable slug on update', async () => {
    const createRes = await request(app)
      .post('/api/v1/admin/collectibles')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        name: 'Original Name',
        slug: 'original-slug',
        category: 'ART',
      });

    const collectibleId = createRes.body.data._id;

    // Attempting to change slug must fail
    const changeSlugRes = await request(app)
      .patch(`/api/v1/admin/collectibles/${collectibleId}`)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        name: 'Updated Name',
        slug: 'new-slug',
      });

    expect(changeSlugRes.status).toBe(400);
    expect(changeSlugRes.body.message).toContain('immutable');

    // Updating name without altering slug succeeds
    const validUpdateRes = await request(app)
      .patch(`/api/v1/admin/collectibles/${collectibleId}`)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        name: 'Updated Name',
      });

    expect(validUpdateRes.status).toBe(200);
    expect(validUpdateRes.body.data.name).toBe('Updated Name');
    expect(validUpdateRes.body.data.slug).toBe('original-slug');
  });

  it('reorders collectibles correctly', async () => {
    const item1 = await Collectible.create({
      name: 'Item 1',
      slug: 'item-1',
      category: 'STAR',
      order: 0,
    });
    const item2 = await Collectible.create({
      name: 'Item 2',
      slug: 'item-2',
      category: 'FLOWER',
      order: 1,
    });

    const res = await request(app)
      .patch('/api/v1/admin/collectibles/reorder')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        items: [
          { id: String(item2._id), order: 0 },
          { id: String(item1._id), order: 1 },
        ],
      });

    expect(res.status).toBe(200);

    const reloaded1 = await Collectible.findById(item1._id);
    const reloaded2 = await Collectible.findById(item2._id);
    expect(reloaded1.order).toBe(1);
    expect(reloaded2.order).toBe(0);
  });

  it('GET /api/v1/public/content includes sanitized collectibles without adminNote', async () => {
    await Collectible.create({
      name: 'Public Star',
      slug: 'public-star',
      category: 'STAR',
      enabled: true,
      isPublished: true,
      adminNote: 'TOP SECRET ADMIN ONLY',
    });

    await Collectible.create({
      name: 'Draft Hidden Star',
      slug: 'draft-star',
      category: 'STAR',
      enabled: true,
      isPublished: false,
    });

    const res = await request(app).get('/api/v1/public/content');
    expect(res.status).toBe(200);
    expect(res.body.data.collectibles).toBeDefined();

    const items = res.body.data.collectibles;
    expect(items.length).toBe(1);
    expect(items[0].slug).toBe('public-star');
    expect(items[0].adminNote).toBeUndefined();
    expect(items[0].__v).toBeUndefined();
  });

  it('cleans up Secret collectibleId reference when collectible is deleted', async () => {
    const col = await Collectible.create({
      name: 'Golden Wing',
      slug: 'golden-wing',
      category: 'MAGIC',
      source: 'SECRET',
    });

    const sec = await Secret.create({
      name: 'Butterfly Whisper',
      slug: 'butterfly-whisper',
      target: { type: 'BUTTERFLY', id: 'golden-butterfly' },
      trigger: { type: 'CLICK', requiredCount: 3 },
      reveal: {
        type: 'COLLECTIBLE',
        collectibleId: col._id,
      },
    });

    expect(sec.reveal.collectibleId.toString()).toBe(col._id.toString());

    // Delete the collectible
    const delRes = await request(app)
      .delete(`/api/v1/admin/collectibles/${col._id}`)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken);

    expect(delRes.status).toBe(200);

    // Verify secret was cleaned up gracefully
    const reloadedSec = await Secret.findById(sec._id);
    expect(reloadedSec.reveal.collectibleId).toBeNull();
    expect(reloadedSec.reveal.type).toBe('MESSAGE');
  });
});
