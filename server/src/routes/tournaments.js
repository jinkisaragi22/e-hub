import { Router } from 'express';
import { prisma } from '../db.js';
import { syncTournaments, syncTournamentDetail } from '../services/pandascore.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { game, q } = req.query;
    await syncTournaments(game || undefined, q || undefined);
    const tournaments = await prisma.tournament.findMany({
      where: {
        ...(game ? { game } : {}),
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      },
      orderBy: { beginAt: 'desc' },
      take: 50,
    });
    res.json(tournaments);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isInteger(id)) await syncTournamentDetail(id);
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        matches: {
          include: { team1: true, team2: true },
          orderBy: { startTime: 'desc' },
        },
      },
    });
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    res.json(tournament);
  } catch (err) {
    next(err);
  }
});

export default router;
