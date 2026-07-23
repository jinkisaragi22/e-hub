import { Router } from 'express';
import { prisma } from '../db.js';
import { syncMatches, syncMatchDetail } from '../services/pandascore.js';

const router = Router();

const STATUS_MAP = {
  upcoming: { db: 'not_started', panda: 'upcoming', order: 'asc' },
  running: { db: 'running', panda: 'running', order: 'asc' },
  finished: { db: 'finished', panda: 'past', order: 'desc' },
};

router.get('/', async (req, res, next) => {
  try {
    const { status = 'upcoming', game } = req.query;
    const mapped = STATUS_MAP[status] ?? STATUS_MAP.upcoming;
    await syncMatches(mapped.panda, game || undefined);
    const matches = await prisma.match.findMany({
      where: { status: mapped.db, ...(game ? { game } : {}) },
      include: { team1: true, team2: true, tournament: true },
      orderBy: { startTime: mapped.order },
      take: 50,
    });
    res.json(matches);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (Number.isInteger(id)) await syncMatchDetail(id);
    const match = await prisma.match.findUnique({
      where: { id },
      include: { team1: true, team2: true, tournament: true },
    });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json(match);
  } catch (err) {
    next(err);
  }
});

export default router;
