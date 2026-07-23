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

const PANDASCORE_ID = 999_000_010;
let matchId;

beforeAll(async () => {
  const match = await prisma.match.upsert({
    where: { pandascoreId: PANDASCORE_ID },
    update: {},
    create: {
      pandascoreId: PANDASCORE_ID,
      name: 'Test A vs Test B',
      game: 'csgo',
      status: 'finished',
      score1: 2,
      score2: 1,
      streams: [{ embed_url: 'https://player.twitch.tv/?channel=test', language: 'en' }],
      mapGames: [
        { position: 1, status: 'finished', length: 1934, winnerPandascoreId: 1 },
        { position: 2, status: 'finished', length: 2100, winnerPandascoreId: 2 },
        { position: 3, status: 'finished', length: 1750, winnerPandascoreId: 1 },
      ],
    },
  });
  matchId = match.id;
});

afterAll(async () => {
  await prisma.match.deleteMany({ where: { pandascoreId: PANDASCORE_ID } });
  await prisma.$disconnect();
});

describe('GET /api/matches/:id', () => {
  it('returns match detail with streams and per-map games', async () => {
    const res = await request(app).get(`/api/matches/${matchId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test A vs Test B');
    expect(res.body.streams).toHaveLength(1);
    expect(res.body.mapGames).toHaveLength(3);
    expect(res.body.mapGames[0].position).toBe(1);
  });

  it('returns 404 for an unknown match', async () => {
    const res = await request(app).get('/api/matches/99999999');
    expect(res.status).toBe(404);
  });
});
