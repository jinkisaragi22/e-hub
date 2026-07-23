import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';

const EMAIL = `test-auth-${Date.now()}@example.com`;
const PASSWORD = 'supersecret123';

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: 'test-auth-' } } });
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: EMAIL, password: PASSWORD });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user.email).toBe(EMAIL);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects a duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: EMAIL, password: PASSWORD });
    expect(res.status).toBe(409);
  });

  it('rejects a short password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: `test-auth-short-${Date.now()}@example.com`, password: 'short' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
  });

  it('rejects a wrong password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the current user with a valid token', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, password: PASSWORD });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(EMAIL);
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
