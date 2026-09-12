import bcrypt from 'bcryptjs';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Admin } from '../src/models/Admin.js';
import { Secret } from '../src/models/Secret.js';

const app = createApp();

describe('Secrets Admin & Public Endpoints', () => {
  let authCookie;
  let csrfToken;

  beforeEach(async () => {
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

  it('GET /api/v1/admin/secrets requires authentication', async () => {
    const res = await request(app).get('/api/v1/admin/secrets');
    expect(res.status).toBe(401);
  });

  it('creates secret with valid target, trigger, conditions, and reveal', async () => {
    const res = await request(app)
      .post('/api/v1/admin/secrets')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        name: 'Butterfly Whisper',
        slug: 'butterfly-whisper',
        target: {
          type: 'BUTTERFLY',
          id: 'golden-butterfly',
        },
        trigger: {
          type: 'MULTI_CLICK',
          requiredCount: 3,
          windowMs: 8000,
        },
        conditions: {
          timeOfDay: ['DAY', 'SUNSET'],
          sectionsVisited: ['ABOUT'],
        },
        reveal: {
          type: 'MESSAGE',
          title: 'Butterfly Note',
          message: 'You unlocked the secret of the golden flutter.',
          visualEffect: 'SPARKLE',
        },
        behavior: {
          repeatable: true,
          cooldownMs: 5000,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('butterfly-whisper');
    expect(res.body.data.target.type).toBe('BUTTERFLY');
    expect(res.body.data.trigger.requiredCount).toBe(3);
    expect(res.body.data.reveal.visualEffect).toBe('SPARKLE');
  });

  it('rejects secret with invalid target or trigger enum', async () => {
    const resTarget = await request(app)
      .post('/api/v1/admin/secrets')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        name: 'Invalid Target',
        slug: 'invalid-target',
        target: { type: 'ROCKET_SHIP' },
        trigger: { type: 'CLICK' },
        reveal: { type: 'MESSAGE', title: 'test' },
      });
    expect(resTarget.status).toBe(422);

    const resTrigger = await request(app)
      .post('/api/v1/admin/secrets')
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        name: 'Invalid Trigger',
        slug: 'invalid-trigger',
        target: { type: 'LAMP' },
        trigger: { type: 'EXPLODE' },
        reveal: { type: 'MESSAGE', title: 'test' },
      });
    expect(resTrigger.status).toBe(422);
  });

  it('rejects self-referencing circular dependency', async () => {
    // Create Secret A
    const secA = await Secret.create({
      name: 'Secret A',
      slug: 'secret-a',
      target: { type: 'LAMP' },
      trigger: { type: 'CLICK' },
      reveal: { type: 'MESSAGE', title: 'A' },
    });

    // Try updating A to require A
    const res = await request(app)
      .patch(`/api/v1/admin/secrets/${secA._id}`)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        conditions: {
          requiresSecretIds: [secA._id.toString()],
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/cannot require itself/i);
  });

  it('rejects cyclic dependency chain (A -> B, B -> A)', async () => {
    const secA = await Secret.create({
      name: 'Secret A',
      slug: 'secret-a',
      target: { type: 'LAMP' },
      trigger: { type: 'CLICK' },
      reveal: { type: 'MESSAGE', title: 'A' },
    });

    const secB = await Secret.create({
      name: 'Secret B',
      slug: 'secret-b',
      target: { type: 'POND' },
      trigger: { type: 'RIPPLE' },
      conditions: {
        requiresSecretIds: [secA._id],
      },
      reveal: { type: 'MESSAGE', title: 'B' },
    });

    // Updating A to require B would create A -> B -> A cycle
    const res = await request(app)
      .patch(`/api/v1/admin/secrets/${secA._id}`)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        conditions: {
          requiresSecretIds: [secB._id.toString()],
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/circular dependency/i);
  });

  it('rejects attempts to change immutable slug on update', async () => {
    const sec = await Secret.create({
      name: 'Old Name',
      slug: 'permanent-slug',
      target: { type: 'TREE' },
      trigger: { type: 'SHAKE' },
      reveal: { type: 'MESSAGE', title: 'Tree' },
    });

    const res = await request(app)
      .patch(`/api/v1/admin/secrets/${sec._id}`)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken)
      .send({
        slug: 'changed-slug',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/immutable/i);
  });

  it('duplicates secret with new unique slug and copy name', async () => {
    const sec = await Secret.create({
      name: 'Original Secret',
      slug: 'original-secret',
      target: { type: 'MAILBOX' },
      trigger: { type: 'LETTER_SENT' },
      reveal: { type: 'MESSAGE', title: 'Letter' },
    });

    const res = await request(app)
      .post(`/api/v1/admin/secrets/${sec._id}/duplicate`)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken);

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe('original-secret-copy');
    expect(res.body.data.name).toBe('Original Secret (Copy)');
    expect(res.body.data.enabled).toBe(false);
  });

  it('deletes secret and removes references from other secrets', async () => {
    const secA = await Secret.create({
      name: 'Secret A',
      slug: 'secret-a',
      target: { type: 'LAMP' },
      trigger: { type: 'CLICK' },
      reveal: { type: 'MESSAGE', title: 'A' },
    });

    const secB = await Secret.create({
      name: 'Secret B',
      slug: 'secret-b',
      target: { type: 'POND' },
      trigger: { type: 'CLICK' },
      conditions: { requiresSecretIds: [secA._id] },
      reveal: { type: 'MESSAGE', title: 'B' },
    });

    const delRes = await request(app)
      .delete(`/api/v1/admin/secrets/${secA._id}`)
      .set('Cookie', authCookie)
      .set('x-csrf-token', csrfToken);

    expect(delRes.status).toBe(200);

    const updatedB = await Secret.findById(secB._id);
    expect(updatedB.conditions.requiresSecretIds).toHaveLength(0);
  });

  it('GET /api/v1/public/content returns published and enabled secrets, omitting unpublished, disabled, and admin notes', async () => {
    // 1. Published & enabled -> should be returned
    await Secret.create({
      name: 'Public Secret',
      slug: 'public-secret',
      enabled: true,
      isPublished: true,
      target: { type: 'BUTTERFLY' },
      trigger: { type: 'MULTI_CLICK', requiredCount: 3 },
      reveal: { type: 'MESSAGE', title: 'Hi' },
      adminNote: 'Internal super secret note',
    });

    // 2. Disabled -> should NOT be returned
    await Secret.create({
      name: 'Disabled Secret',
      slug: 'disabled-secret',
      enabled: false,
      isPublished: true,
      target: { type: 'LAMP' },
      trigger: { type: 'CLICK' },
      reveal: { type: 'MESSAGE', title: 'Disabled' },
    });

    // 3. Unpublished -> should NOT be returned
    await Secret.create({
      name: 'Unpublished Secret',
      slug: 'unpublished-secret',
      enabled: true,
      isPublished: false,
      target: { type: 'TREE' },
      trigger: { type: 'SHAKE' },
      reveal: { type: 'MESSAGE', title: 'Unpub' },
    });

    const res = await request(app).get('/api/v1/public/content');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.secrets).toBeDefined();
    expect(res.body.data.secrets).toHaveLength(1);

    const publicSec = res.body.data.secrets[0];
    expect(publicSec.slug).toBe('public-secret');
    expect(publicSec.name).toBe('Public Secret');
    expect(publicSec.adminNote).toBeUndefined();
    expect(publicSec.__v).toBeUndefined();
  });
});

