import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import teamsRouter from './routes/teams.js';
import playersRouter from './routes/players.js';
import matchesRouter from './routes/matches.js';
import tournamentsRouter from './routes/tournaments.js';
import favoritesRouter from './routes/favorites.js';
import { errorHandler } from './middleware/errors.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/players', playersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/tournaments', tournamentsRouter);
app.use('/api/favorites', favoritesRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);
