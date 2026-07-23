import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';

const EMAIL = `test-fav-${Date.now()}@example.com`;
const PANDASCORE_ID = 999_000_002;
let token;
let teamId;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: EMAIL, password: 'supersecret123' });
  token = res.body.token;

  const team = await prisma.team.upsert({
    where: { pandascoreId: PANDASCORE_ID },
    update: {},
    create: { pandascoreId: PANDASCORE_ID, name: 'Fav Test Team', game: 'csgo' },
  });
  teamId = team.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: 'test-fav-' } } });
  await prisma.team.deleteMany({ where: { pandascoreId: PANDASCORE_ID } });
  await prisma.$disconnect();
});

describe('favorites', () => {
  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/favorites');
    expect(res.status).toBe(401);
  });

  it('adds a favorite', async () => {
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ teamId });
    expect(res.status).toBe(201);
  });

  it('rejects a duplicate favorite with 409', async () => {
    const res = await request(app)
      .post('/api/favorites')
      .set('Authorization', `Bearer ${token}`)
      .send({ teamId });
    expect(res.status).toBe(409);
  });

  it('lists favorite teams', async () => {
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.some((t) => t.id === teamId)).toBe(true);
  });

  it('removes a favorite', async () => {
    const res = await request(app)
      .delete(`/api/favorites/${teamId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);

    const list = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body.some((t) => t.id === teamId)).toBe(false);
  });
});
