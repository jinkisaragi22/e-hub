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

const PANDASCORE_ID = 999_000_020;
let tournamentId;

beforeAll(async () => {
  const tournament = await prisma.tournament.upsert({
    where: { pandascoreId: PANDASCORE_ID },
    update: {},
    create: {
      pandascoreId: PANDASCORE_ID,
      name: 'Test Championship',
      game: 'lol',
      standings: [
        { rank: 1, wins: 5, losses: 1, team: { name: 'Alpha', imageUrl: null } },
        { rank: 2, wins: 4, losses: 2, team: { name: 'Beta', imageUrl: null } },
      ],
      brackets: [
        {
          pandascoreId: 1,
          name: 'Grand final',
          round: 2,
          status: 'not_started',
          opponents: [{ name: 'Alpha', score: null }, { name: 'Beta', score: null }],
        },
      ],
    },
  });
  tournamentId = tournament.id;
});

afterAll(async () => {
  await prisma.tournament.deleteMany({ where: { pandascoreId: PANDASCORE_ID } });
  await prisma.$disconnect();
});

describe('GET /api/tournaments/:id', () => {
  it('returns standings and brackets', async () => {
    const res = await request(app).get(`/api/tournaments/${tournamentId}`);
    expect(res.status).toBe(200);
    expect(res.body.standings).toHaveLength(2);
    expect(res.body.standings[0].rank).toBe(1);
    expect(res.body.brackets[0].round).toBe(2);
  });

  it('returns 404 for an unknown tournament', async () => {
    const res = await request(app).get('/api/tournaments/99999999');
    expect(res.status).toBe(404);
  });
});
