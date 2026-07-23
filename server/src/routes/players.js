import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.get('/:id', async (req, res, next) => {
  try {
    const player = await prisma.player.findUnique({
      where: { id: Number(req.params.id) },
      include: { team: true },
    });
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (err) {
    next(err);
  }
});

export default router;
