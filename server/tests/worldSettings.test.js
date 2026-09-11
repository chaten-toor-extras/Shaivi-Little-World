import bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Admin } from '../src/models/Admin.js';
import { WorldSettings } from '../src/models/WorldSettings.js';
import { defaultWorldSettings } from '../src/seeds/defaultWorldSettings.js';

const app = createApp();

describe('World Settings Admin & Public Endpoints', () => {
  let authCookie;
  let csrfToken = 'test-csrf';

  beforeEach(async () => {
    // Seed default world settings
    await WorldSettings.create(defaultWorldSettings);

    // Create admin user and login to obtain cookies
    const passwordHash = await bcrypt.hash('adminSecret123', 10);
    await Admin.create({
      email: 'worldadmin@studio.com',
      passwordHash,
      isActive: true,
      role: 'admin',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'worldadmin@studio.com', password: 'adminSecret123' });

    authCookie = loginRes.headers['set-cookie'];
    const csrfMatch = authCookie?.find((c) => c.includes('csrf_token'));
    csrfToken = csrfMatch ? csrfMatch.split(';')[0].split('=')[1] : 'test-csrf';
  });

  it('GET /api/v1/admin/world returns full settings singleton', async () => {
    const res = await request(app)
      .get('/api/v1/admin/world')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.schemaVersion).toBe(2);
    expect(res.body.data.dayNight).toBeDefined();
    expect(res.body.data.dayNight.mode).toBe('automatic');
    expect(res.body.data.scene.backgroundColor).toBe('#d5cbdc');
    expect(res.body.data.lighting.hemisphere.intensity).toBe(2.0);
  });

  it('PATCH /api/v1/admin/world unauthenticated returns 401', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .send({ scene: { backgroundColor: '#112233' } });

    expect(res.status).toBe(401);
  });

  it('PATCH /api/v1/admin/world updates settings and deep-merges', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        scene: { backgroundColor: '#aabbcc' },
        lighting: {
          directional: { intensity: 4.5 },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.scene.backgroundColor).toBe('#aabbcc');
    // Verify untouched nested properties are preserved
    expect(res.body.data.scene.fog.color).toBe('#d5cbdc');
    expect(res.body.data.lighting.directional.intensity).toBe(4.5);
    expect(res.body.data.lighting.hemisphere.intensity).toBe(2.0);
    expect(res.body.data.identity.worldTitle).toBe("Shaivi's Little World");
  });

  it('PATCH /api/v1/admin/world accepts payload containing Mongoose metadata (_id, __v, createdAt, updatedAt, schemaVersion)', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        _id: '674e1234567890abcdef1234',
        __v: 0,
        createdAt: '2026-09-10T12:00:00.000Z',
        updatedAt: '2026-09-10T12:00:00.000Z',
        schemaVersion: 1,
        scene: { backgroundColor: '#112233' },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.scene.backgroundColor).toBe('#112233');
  });

  it('PATCH /api/v1/admin/world rejects invalid hex colors', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        scene: { backgroundColor: 'not-a-color' },
      });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/admin/world rejects out-of-bounds intensity', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        lighting: {
          directional: { intensity: 9999 },
        },
      });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/admin/world rejects invalid fog range where near >= far', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        scene: {
          fog: { near: 80, far: 20 },
        },
      });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/admin/world rejects disabling all sections', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        sections: {
          ABOUT: { enabled: false, label: 'About' },
          QUOTES: { enabled: false, label: 'Quotes' },
          GALLERY: { enabled: false, label: 'Gallery' },
          JOURNEY: { enabled: false, label: 'Journey' },
          CONTACT: { enabled: false, label: 'Contact' },
          MUSIC: { enabled: false, label: 'Music' },
        },
      });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/admin/world/reset/:section resets only the specified section', async () => {
    // First modify lighting and scene
    await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        scene: { backgroundColor: '#112233' },
        lighting: { directional: { intensity: 5.0 } },
      });

    // Reset only lighting
    const resetRes = await request(app)
      .post('/api/v1/admin/world/reset/lighting')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken);

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.data.lighting.directional.intensity).toBe(3.0);
    // Scene background color should stay modified
    expect(resetRes.body.data.scene.backgroundColor).toBe('#112233');
  });

  it('POST /api/v1/admin/world/reset restores all defaults', async () => {
    // Modify multiple sections
    await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        scene: { backgroundColor: '#112233' },
        identity: { worldTitle: 'Renamed World' },
      });

    // Reset all
    const resetRes = await request(app)
      .post('/api/v1/admin/world/reset')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken);

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.data.scene.backgroundColor).toBe('#d5cbdc');
    expect(resetRes.body.data.identity.worldTitle).toBe("Shaivi's Little World");
  });

  it('GET /api/v1/public/content includes safe world configuration with dayNight', async () => {
    const res = await request(app).get('/api/v1/public/content');

    expect(res.status).toBe(200);
    expect(res.body.data.world).toBeDefined();
    expect(res.body.data.world.schemaVersion).toBe(2);
    expect(res.body.data.world.scene.backgroundColor).toBe('#d5cbdc');
    expect(res.body.data.world.dayNight).toBeDefined();
    expect(res.body.data.world.dayNight.schedule.morningStart).toBe('05:30');
    expect(res.body.data.world.dayNight.profiles.night.backgroundColor).toBe('#1b1e2e');
    // Ensure internal fields are excluded
    expect(res.body.data.world._id).toBeUndefined();
    expect(res.body.data.world.__v).toBeUndefined();
  });

  it('PATCH /api/v1/admin/world updates Day/Night mode and profiles', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        dayNight: {
          mode: 'fixed',
          fixedPeriod: 'NIGHT',
          profiles: {
            night: {
              backgroundColor: '#151724',
              stars: { density: 'SPARSE' },
            },
          },
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.dayNight.mode).toBe('fixed');
    expect(res.body.data.dayNight.fixedPeriod).toBe('NIGHT');
    expect(res.body.data.dayNight.profiles.night.backgroundColor).toBe('#151724');
    expect(res.body.data.dayNight.profiles.night.stars.density).toBe('SPARSE');
    // Untouched profile properties remain intact
    expect(res.body.data.dayNight.profiles.night.lampDefaultLit).toBe(true);
    expect(res.body.data.dayNight.profiles.day.backgroundColor).toBe('#d5cbdc');
  });

  it('PATCH /api/v1/admin/world rejects invalid IANA timezone', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        dayNight: {
          fixedTimezone: 'Shaivi/Bedroom',
        },
      });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/admin/world rejects invalid schedule order', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        dayNight: {
          schedule: {
            morningStart: '09:00',
            dayStart: '08:00',
            sunsetStart: '17:00',
            nightStart: '19:00',
          },
        },
      });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/admin/world rejects transition duration > 20s', async () => {
    const res = await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        dayNight: {
          transition: { durationSeconds: 25 },
        },
      });

    expect([400, 422]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/admin/world/reset/dayNight resets entire dayNight system to defaults', async () => {
    // First alter a profile
    await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        dayNight: {
          mode: 'fixed',
          profiles: { night: { backgroundColor: '#111111' } },
        },
      });

    const resetRes = await request(app)
      .post('/api/v1/admin/world/reset/dayNight')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken);

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.data.dayNight.mode).toBe('automatic');
    expect(resetRes.body.data.dayNight.profiles.night.backgroundColor).toBe('#1b1e2e');
  });

  it('POST /api/v1/admin/world/reset/dayNight.profiles.night resets only night profile', async () => {
    await request(app)
      .patch('/api/v1/admin/world')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        dayNight: {
          profiles: {
            morning: { backgroundColor: '#222222' },
            night: { backgroundColor: '#333333' },
          },
        },
      });

    const resetRes = await request(app)
      .post('/api/v1/admin/world/reset/dayNight.profiles.night')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken);

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.data.dayNight.profiles.night.backgroundColor).toBe('#1b1e2e');
    // Morning modification is preserved
    expect(resetRes.body.data.dayNight.profiles.morning.backgroundColor).toBe('#222222');
  });
});
