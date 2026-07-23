import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      include: { team: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(favorites.map((f) => f.team));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const parsed = z.object({ teamId: z.number().int() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'teamId (number) is required' });
    const { teamId } = parsed.data;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const existing = await prisma.favorite.findUnique({
      where: { userId_teamId: { userId: req.userId, teamId } },
    });
    if (existing) return res.status(409).json({ error: 'Already a favorite' });

    await prisma.favorite.create({ data: { userId: req.userId, teamId } });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:teamId', async (req, res, next) => {
  try {
    const teamId = Number(req.params.teamId);
    await prisma.favorite.deleteMany({ where: { userId: req.userId, teamId } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
