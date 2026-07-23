import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';

vi.mock('../src/services/pandascore.js', () => ({
  syncTeams: vi.fn().mockResolvedValue(undefined),
  syncTeamDetail: vi.fn().mockResolvedValue(null),
  syncMatches: vi.fn().mockResolvedValue(undefined),
  syncMatchDetail: vi.fn().mockResolvedValue(null),
  syncTournaments: vi.fn().mockResolvedValue(undefined),
  syncTournamentDetail: vi.fn().mockResolvedValue(null),
}));

const { app } = await import('../src/app.js');
const { prisma } = await import('../src/db.js');

const PANDASCORE_ID = 999_000_001;
const PANDASCORE_ID_CSGO = 999_000_003;
const PANDASCORE_ID_ACADEMY = 999_000_004;
let teamId;

beforeAll(async () => {
  const team = await prisma.team.upsert({
    where: { pandascoreId: PANDASCORE_ID },
    update: {},
    create: {
      pandascoreId: PANDASCORE_ID,
      name: 'Test Liquid',
      acronym: 'TL',
      game: 'lol',
    },
  });
  teamId = team.id;

  // Same org, different game — "Team " prefix must not break the link
  await prisma.team.upsert({
    where: { pandascoreId: PANDASCORE_ID_CSGO },
    update: {},
    create: { pandascoreId: PANDASCORE_ID_CSGO, name: 'Team Test Liquid', game: 'csgo' },
  });
  // Different org despite the shared word — must NOT be linked
  await prisma.team.upsert({
    where: { pandascoreId: PANDASCORE_ID_ACADEMY },
    update: {},
    create: { pandascoreId: PANDASCORE_ID_ACADEMY, name: 'Test Liquid Academy', game: 'lol' },
  });
});

afterAll(async () => {
  await prisma.team.deleteMany({
    where: {
      pandascoreId: { in: [PANDASCORE_ID, PANDASCORE_ID_CSGO, PANDASCORE_ID_ACADEMY] },
    },
  });
  await prisma.$disconnect();
});

describe('GET /api/teams', () => {
  it('returns a paginated list of teams', async () => {
    const res = await request(app).get('/api/teams?game=lol');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.teams)).toBe(true);
    expect(res.body.page).toBe(1);
    expect(typeof res.body.total).toBe('number');
    expect(typeof res.body.hasMore).toBe('boolean');
    expect(res.body.teams.length).toBeGreaterThan(0);
    expect(res.body.teams.every((t) => t.game === 'lol')).toBe(true);
  });

  it('filters by search query', async () => {
    const res = await request(app).get('/api/teams?q=test liquid');
    expect(res.status).toBe(200);
    expect(res.body.teams.every((t) => t.name.toLowerCase().includes('test liquid'))).toBe(true);
  });
});

describe('GET /api/teams/:id', () => {
  it('returns a team with players and recent matches', async () => {
    const res = await request(app).get(`/api/teams/${teamId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Liquid');
    expect(Array.isArray(res.body.players)).toBe(true);
    expect(Array.isArray(res.body.recentMatches)).toBe(true);
  });

  it('lists other divisions of the same org across games', async () => {
    const res = await request(app).get(`/api/teams/${teamId}`);
    expect(res.status).toBe(200);
    const names = res.body.divisions.map((d) => d.name);
    expect(names).toContain('Team Test Liquid'); // same org, csgo
    expect(names).not.toContain('Test Liquid Academy'); // different org
    expect(names).not.toContain('Test Liquid'); // not itself
  });

  it('returns 404 for an unknown team', async () => {
    const res = await request(app).get('/api/teams/99999999');
    expect(res.status).toBe(404);
  });
});
