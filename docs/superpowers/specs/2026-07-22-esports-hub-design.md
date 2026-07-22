# Esports Hub (e-hub) — Design Spec

**Date:** 2026-07-22
**Goal:** Full-stack esports platform portfolio project for a Team Liquid job application — a "miniature TeamLiquid.net".

## Overview

A web app to explore esports teams, players, tournaments, and match schedules with live data from PandaScore, per-user favorites, search, dark mode, and responsive design.

## Stack

- **Frontend:** React 18 + Vite, Tailwind CSS, React Router
- **Backend:** Node.js + Express, Prisma ORM
- **Database:** PostgreSQL (local)
- **External data:** PandaScore API (free tier) — server-side only
- **Auth:** JWT (email + bcrypt-hashed password)
- **Validation:** zod
- **Tests:** Vitest + Supertest (auth + teams endpoints)

## Repository layout

```
e-hub/
├── client/          # React + Vite + Tailwind
├── server/          # Express + Prisma
├── docs/superpowers/specs/
├── .gitignore
└── README.md
```

## Data flow

Client → Express API → PostgreSQL cache → PandaScore.

- The client never calls PandaScore directly (API key stays server-side).
- Endpoints read the DB first. If data is missing or stale, the server fetches
  from PandaScore, upserts via Prisma, then serves from the DB.
- Staleness TTLs: matches ~10 minutes; teams/players/tournaments ~24 hours.
- If PandaScore errors or rate-limits, serve whatever is cached (graceful degradation).

**Games covered:** League of Legends, CS2, Dota 2, Valorant — game filter across the UI.

## Data model (Prisma)

- `User` — id, email (unique), passwordHash, createdAt; has many Favorites
- `Team` — id, pandascoreId (unique), name, acronym, imageUrl, game; has many Players, Favorites
- `Player` — id, pandascoreId (unique), name, firstName, lastName, role, nationality, imageUrl; belongs to Team (nullable)
- `Match` — id, pandascoreId (unique), name, game, status (upcoming/running/finished), startTime, team1/team2 relations (nullable), score1, score2, tournament relation
- `Tournament` — id, pandascoreId (unique), name, game, tier, prizePool, beginAt, endAt; has many Matches
- `Favorite` — userId + teamId composite unique
- Cache metadata: `fetchedAt` timestamps on cached entities to drive TTL checks

## API surface

Auth:
- `POST /api/auth/register` → { token, user }
- `POST /api/auth/login` → { token, user }
- `GET /api/auth/me` (JWT)

Data (public):
- `GET /api/teams?game=&q=` — searchable team list
- `GET /api/teams/:id` — team + roster + recent matches
- `GET /api/players/:id`
- `GET /api/matches?status=upcoming|running|finished&game=`
- `GET /api/matches/:id` — match detail with stats
- `GET /api/tournaments?game=&q=`
- `GET /api/tournaments/:id` — tournament + its matches

Favorites (JWT-protected):
- `GET /api/favorites`
- `POST /api/favorites` { teamId }
- `DELETE /api/favorites/:teamId`

## Frontend pages

1. **Home** — hero, live/upcoming matches ticker, featured tournaments
2. **Matches** — filters (game, status), live scores, match detail view
3. **Tournaments** — searchable list; detail shows tournament matches
4. **Teams** — searchable grid; team profile with roster, recent results, ⭐ favorite toggle
5. **Player profile**
6. **Login / Register**; favorites view for logged-in users
7. Dark theme default with light-mode toggle; fully responsive

## Error handling

- Central Express error middleware; zod validation on all inputs
- 401 on missing/invalid JWT; 404 for unknown resources
- PandaScore failures fall back to cached DB data; empty-state UI when nothing cached

## Testing

- Vitest + Supertest: auth flow (register/login/me) and teams endpoints
- Not aiming for full coverage — demonstrating testing practice

## Deliverables

- Working app (client + server) runnable locally
- `.gitignore` (node_modules, .env, dist, etc.)
- `.env.example` for server (DATABASE_URL, PANDASCORE_API_KEY, JWT_SECRET)
- Full README: features, stack, screenshots placeholder, setup steps including PandaScore signup

## Out of scope

- Riot API / HLTV integration (README mentions as future work)
- Full bracket visualization, forums, news CMS
- Deployment (README notes options: Vercel + Render/Railway + Neon)
