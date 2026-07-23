import { Router } from 'express';
import { prisma } from '../db.js';
import { syncTeams, syncTeamDetail } from '../services/pandascore.js';

const router = Router();

// "Team Liquid" and "Liquid" are the same org; "Team Liquid Academy" is not.
function orgBaseName(name) {
  return name.toLowerCase().replace(/^team\s+/, '').trim();
}

async function findDivisions(team) {
  const base = orgBaseName(team.name);
  const candidates = await prisma.team.findMany({
    where: {
      id: { not: team.id },
      name: { contains: base, mode: 'insensitive' },
    },
    orderBy: { game: 'asc' },
  });
  return candidates.filter((t) => orgBaseName(t.name) === base);
}

router.get('/', async (req, res, next) => {
  try {
    const { game, q } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    await syncTeams(game || undefined, q || undefined, page);
    const where = {
      ...(game ? { game } : {}),
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
    };
    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * 50,
        take: 50,
      }),
      prisma.team.count({ where }),
    ]);
    // total == page*50 usually means PandaScore has more pages we haven't
    // cached yet — one extra "load more" returning nothing settles it.
    res.json({ teams, page, total, hasMore: page * 50 <= total });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    let team = await prisma.team.findUnique({
      where: { id },
      include: { players: true },
    });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Refresh roster from PandaScore if we have no players cached yet
    if (team.players.length === 0) {
      await syncTeamDetail(team.pandascoreId);
      team = await prisma.team.findUnique({ where: { id }, include: { players: true } });
    }

    const divisions = await findDivisions(team);

    const recentMatches = await prisma.match.findMany({
      where: { OR: [{ team1Id: id }, { team2Id: id }] },
      include: { team1: true, team2: true, tournament: true },
      orderBy: { startTime: 'desc' },
      take: 10,
    });

    res.json({ ...team, divisions, recentMatches });
  } catch (err) {
    next(err);
  }
});

export default router;
