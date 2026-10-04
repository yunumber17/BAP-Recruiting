import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createApp } from '../../src/api/app.js';
import { createContainer, type Container } from '../../src/di/container.js';
import { devToken } from '../../src/auth/DevTokenVerifier.js';
import { makeSchool } from '../helpers.js';
import type { School } from '../../src/types/models.js';

let container: Container;
let app: ReturnType<typeof createApp>;
let seedSchool: School;

beforeEach(() => {
  seedSchool = makeSchool();
  container = createContainer({ seedSchools: [seedSchool] });
  app = createApp(container);
});

describe('POST /api/players + auth-guarded routes', () => {
  it('creates a player (201) with valid body', async () => {
    const userId = randomUUID();
    const res = await request(app).post('/api/players').send({
      userId, firstName: 'Taro', lastName: 'Yamada',
      graduationYear: 2027, primaryPosition: 'SHORTSTOP', gpa: 3.8,
    });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('rejects an invalid body (400 VALIDATION_ERROR)', async () => {
    const res = await request(app).post('/api/players').send({ firstName: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('404s an unknown player', async () => {
    const res = await request(app).get(`/api/players/${randomUUID()}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('requires auth to PATCH (401)', async () => {
    const create = await request(app).post('/api/players').send({
      userId: randomUUID(), firstName: 'A', lastName: 'B',
      graduationYear: 2027, primaryPosition: 'P',
    });
    const res = await request(app).patch(`/api/players/${create.body.id}`).send({ firstName: 'C' });
    expect(res.status).toBe(401);
  });

  it('lets the owner PATCH with a bearer token', async () => {
    const userId = randomUUID();
    const create = await request(app).post('/api/players').send({
      userId, firstName: 'A', lastName: 'B', graduationYear: 2027, primaryPosition: 'P',
    });
    const token = devToken({ userId, role: 'PLAYER', playerId: create.body.id });
    const res = await request(app)
      .patch(`/api/players/${create.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Zed' });
    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Zed');
  });
});

describe('school search + saved schools + recruiting', () => {
  it('searches schools (empty-safe) and returns a page', async () => {
    const res = await request(app).get('/api/schools/search?division=D1&page=1&pageSize=10');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('saves a school for the authed player, then blocks a duplicate (409)', async () => {
    const playerId = randomUUID();
    const token = devToken({ userId: playerId, role: 'PLAYER', playerId });
    const body = { playerId, schoolId: seedSchool.id };

    const first = await request(app)
      .post('/api/saved-schools').set('Authorization', `Bearer ${token}`).send(body);
    expect(first.status).toBe(201);

    const dup = await request(app)
      .post('/api/saved-schools').set('Authorization', `Bearer ${token}`).send(body);
    expect(dup.status).toBe(409);
    expect(dup.body.error.code).toBe('CONFLICT');
  });

  it('recruiting score compute returns 502 while engine is unwired', async () => {
    const playerId = randomUUID();
    // seed a player row so the service passes the player check
    const player = await container.repositories.players.create({
      userId: playerId, firstName: 'T', lastName: 'Y',
      graduationYear: 2027, primaryPosition: 'SHORTSTOP',
    });
    const token = devToken({ userId: playerId, role: 'PLAYER', playerId: player.id });
    const res = await request(app)
      .post('/api/recruiting/score')
      .set('Authorization', `Bearer ${token}`)
      .send({ playerId: player.id, schoolId: seedSchool.id });
    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('EXTERNAL_SERVICE_ERROR');
  });
});
