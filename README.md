# e-hub — Esports Hub

A full-stack esports platform: explore teams, players, tournaments and live match schedules across **League of Legends, CS2, Dota 2 and Valorant** — with real data from the PandaScore API, per-user favorites, search, dark mode and a fully responsive UI. A miniature TeamLiquid.net.

## ✨ Features

- 🔍 **Search** tournaments and teams (debounced, server-side)
- 👤 **Player profiles** — role, nationality, team
- 🏆 **Team profiles** — roster, recent results
- 📅 **Upcoming & live matches** with real-time scores and a LIVE indicator
- 📊 **Match statistics** — live scores, per-map breakdowns, embedded Twitch streams
- 🏅 **Tournament standings & playoff brackets**
- 🔗 **Cross-game organizations** — jump between an org's divisions (LoL ↔ CS2 ↔ Valorant…)
- ⭐ **Favorite teams** — saved per account (JWT auth)
- 🌙 **Dark mode** by default, light mode toggle
- 📱 **Responsive** from mobile to desktop

## 🧱 Tech Stack

| Layer     | Tech                                                    |
| --------- | ------------------------------------------------------- |
| Frontend  | React 18, Vite, Tailwind CSS, React Router, Axios       |
| Backend   | Node.js, Express, Zod, JWT (jsonwebtoken), bcryptjs     |
| Database  | PostgreSQL + Prisma ORM                                 |
| Data      | [PandaScore API](https://pandascore.co)                 |
| Testing   | Vitest + Supertest                                      |

## 🏗 Architecture

```
React (Vite) ──▶ Express API ──▶ PostgreSQL (cache) ──▶ PandaScore API
   client            server           Prisma              live data
```

The client only ever talks to the Express API — the PandaScore key stays server-side. Endpoints read the database first; when data is missing or stale (10 min TTL for matches, 24 h for teams/players/tournaments) the server refreshes it from PandaScore and upserts via Prisma. If PandaScore is down or rate-limited, cached data is served instead.

## 📸 Screenshots

> _Coming soon._

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL running locally
- A free [PandaScore](https://app.pandascore.co) account — sign up, then copy your API token from the dashboard

### 1. Clone & configure

```bash
git clone https://github.com/<you>/e-hub.git
cd e-hub/server
cp .env.example .env
```

Edit `server/.env`:

```env
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/ehub?schema=public"
JWT_SECRET="a-long-random-string"
PANDASCORE_API_KEY="<your pandascore token>"
PORT=4000
```

### 2. Install & migrate

```bash
# server
cd server
npm install
npx prisma migrate dev

# client
cd ../client
npm install
```

### 3. Run

```bash
# terminal 1 — API on :4000
cd server && npm run dev

# terminal 2 — client on :5173 (proxies /api to :4000)
cd client && npm run dev
```

Open http://localhost:5173.

### 4. Tests

```bash
cd server && npm test
```

## 📡 API Endpoints

| Method | Endpoint                          | Auth | Description                          |
| ------ | --------------------------------- | ---- | ------------------------------------ |
| POST   | `/api/auth/register`              | —    | Create account, returns JWT          |
| POST   | `/api/auth/login`                 | —    | Log in, returns JWT                  |
| GET    | `/api/auth/me`                    | ✅   | Current user                         |
| GET    | `/api/teams?game=&q=`             | —    | List/search teams                    |
| GET    | `/api/teams/:id`                  | —    | Team + roster + recent matches       |
| GET    | `/api/players/:id`                | —    | Player profile                       |
| GET    | `/api/matches?status=&game=`      | —    | Matches (upcoming/running/finished)  |
| GET    | `/api/matches/:id`                | —    | Match detail                         |
| GET    | `/api/tournaments?game=&q=`       | —    | List/search tournaments              |
| GET    | `/api/tournaments/:id`            | —    | Tournament + its matches             |
| GET    | `/api/favorites`                  | ✅   | Your favorite teams                  |
| POST   | `/api/favorites`                  | ✅   | Add favorite `{ teamId }`            |
| DELETE | `/api/favorites/:teamId`          | ✅   | Remove favorite                      |

## 🗺 Roadmap

- Riot API integration for deeper LoL stats
- HLTV data for CS2 (where permitted)
- Detailed player statistics (requires a paid PandaScore tier)
- Deployment: Vercel (client) + Railway/Render (API) + Neon (Postgres)

## 📄 License

MIT
