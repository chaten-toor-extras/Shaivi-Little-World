import bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { migrateMoodWorldEffects } from '../src/migrations/moodWorldEffects.js';
import { Admin } from '../src/models/Admin.js';
import { Mood } from '../src/models/Mood.js';
import { Song } from '../src/models/Song.js';
import { WorldSettings } from '../src/models/WorldSettings.js';
import { defaultWorldSettings } from '../src/seeds/defaultWorldSettings.js';

const app = createApp();

describe('Mood World Effect & Music Mood Integration', () => {
  let authCookie;
  let csrfToken = 'test-csrf';

  beforeEach(async () => {
    await WorldSettings.create(defaultWorldSettings);

    const passwordHash = await bcrypt.hash('adminSecret123', 10);
    await Admin.create({
      email: 'musicadmin@studio.com',
      passwordHash,
      isActive: true,
      role: 'admin',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'musicadmin@studio.com', password: 'adminSecret123' });

    authCookie = loginRes.headers['set-cookie'];
    const csrfMatch = authCookie?.find((c) => c.includes('csrf_token'));
    csrfToken = csrfMatch ? csrfMatch.split(';')[0].split('=')[1] : 'test-csrf';
  });

  it('PATCH /api/v1/admin/moods/:id unauthenticated returns 401', async () => {
    const mood = await Mood.create({
      name: 'Dreamy',
      paperColor: '#c9c5df',
      inkColor: '#474059',
    });

    const res = await request(app)
      .patch('/api/v1/admin/moods/' + mood._id)
      .send({ worldEffect: { enabled: true, intensity: 0.9 } });

    expect(res.status).toBe(401);
  });

  it('PATCH /api/v1/admin/moods/:id updates worldEffect and preserves existing songs', async () => {
    const song = await Song.create({
      title: 'Midnight Air',
      artist: 'Demo Artist',
      duration: 180,
    });

    const mood = await Mood.create({
      name: 'Dreamy',
      paperColor: '#c9c5df',
      inkColor: '#474059',
      songIds: [song._id],
    });

    const res = await request(app)
      .patch('/api/v1/admin/moods/' + mood._id)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        worldEffect: {
          enabled: true,
          intensity: 0.85,
          scene: {
            tint: '#b99be8',
            tintStrength: 0.25,
            fogMultiplier: 1.15,
          },
          lighting: {
            intensityMultiplier: 0.9,
            tint: '#c7b4e9',
            tintStrength: 0.2,
          },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.worldEffect.enabled).toBe(true);
    expect(res.body.data.worldEffect.intensity).toBe(0.85);
    expect(res.body.data.worldEffect.scene.tint).toBe('#b99be8');
    expect(res.body.data.worldEffect.scene.tintStrength).toBe(0.25);
    expect(res.body.data.worldEffect.scene.fogMultiplier).toBe(1.15);
    // Preserves existing properties
    expect(res.body.data.name).toBe('Dreamy');
    expect(res.body.data.songIds.map(String)).toContain(String(song._id));
  });

  it('PATCH /api/v1/admin/moods/:id rejects invalid hex colors in worldEffect', async () => {
    const mood = await Mood.create({
      name: 'Calm',
      paperColor: '#d7ddc5',
      inkColor: '#354537',
    });

    const res = await request(app)
      .patch('/api/v1/admin/moods/' + mood._id)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        worldEffect: {
          scene: {
            tint: 'not-a-hex-color',
          },
        },
      });

    expect(res.status).toBe(422);
  });

  it('PATCH /api/v1/admin/moods/:id rejects out-of-bounds multipliers and strengths', async () => {
    const mood = await Mood.create({
      name: 'Focus',
      paperColor: '#d8ceba',
      inkColor: '#474334',
    });

    // Test tintStrength > 1
    let res = await request(app)
      .patch('/api/v1/admin/moods/' + mood._id)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        worldEffect: {
          scene: {
            tintStrength: 1.5,
          },
        },
      });
    expect(res.status).toBe(422);

    // Test intensityMultiplier < 0.5
    res = await request(app)
      .patch('/api/v1/admin/moods/' + mood._id)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        worldEffect: {
          lighting: {
            intensityMultiplier: 0.1,
          },
        },
      });
    expect(res.status).toBe(422);

    // Test cloudSpeedMultiplier > 2.0
    res = await request(app)
      .patch('/api/v1/admin/moods/' + mood._id)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        worldEffect: {
          atmosphere: {
            cloudSpeedMultiplier: 5.0,
          },
        },
      });
    expect(res.status).toBe(422);
  });

  it('GET /api/v1/public/content includes safe worldEffect and slug on published moods', async () => {
    await Mood.create({
      name: 'Late Night',
      slug: 'late-night',
      paperColor: '#343341',
      inkColor: '#e7ddce',
      isPublished: true,
      worldEffect: {
        enabled: true,
        intensity: 0.95,
        scene: {
          tint: '#262b45',
          tintStrength: 0.22,
          fogMultiplier: 1.1,
        },
      },
    });

    // Unpublished mood should not appear
    await Mood.create({
      name: 'Secret Mood',
      slug: 'secret-mood',
      paperColor: '#000000',
      inkColor: '#ffffff',
      isPublished: false,
    });

    const res = await request(app).get('/api/v1/public/content');

    expect(res.status).toBe(200);
    const moods = res.body.data.music.moods;
    const lateNight = moods.find((m) => m.name === 'Late Night');
    expect(lateNight).toBeDefined();
    expect(lateNight.slug).toBe('late-night');
    expect(lateNight.worldEffect).toBeDefined();
    expect(lateNight.worldEffect.enabled).toBe(true);
    expect(lateNight.worldEffect.intensity).toBe(0.95);
    expect(lateNight.worldEffect.scene.tint).toBe('#262b45');

    // Secret mood omitted
    expect(moods.find((m) => m.name === 'Secret Mood')).toBeUndefined();
  });

  it('PATCH /api/v1/admin/world updates global musicMood integration settings', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        musicMood: {
          enabled: false,
          transitionDuration: 4.0,
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.musicMood.enabled).toBe(false);
    expect(res.body.data.musicMood.transitionDuration).toBe(4.0);

    // Public content should reflect it
    const publicRes = await request(app).get('/api/v1/public/content');
    expect(publicRes.body.data.world.musicMood.enabled).toBe(false);
    expect(publicRes.body.data.world.musicMood.transitionDuration).toBe(4.0);
  });

  it('migrateMoodWorldEffects is idempotent and safely assigns slugs and worldEffects', async () => {
    await Mood.create({
      name: 'Calm',
      paperColor: '#d7ddc5',
      inkColor: '#354537',
    });

    const migrationResult = await migrateMoodWorldEffects();
    expect(migrationResult.total).toBeGreaterThanOrEqual(1);

    const migrated = await Mood.findOne({ name: 'Calm' });
    expect(migrated.slug).toBe('calm');
    expect(migrated.worldEffect).toBeDefined();
    expect(migrated.worldEffect.scene.tint).toBe('#c7d6c5');

    // Running again does not corrupt or error
    const secondRun = await migrateMoodWorldEffects();
    expect(secondRun.updated).toBe(0);
  });
});
