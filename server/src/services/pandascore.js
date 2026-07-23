import axios from 'axios';
import { config } from '../config.js';
import { prisma } from '../db.js';

const TTL_MATCHES_MS = 10 * 60 * 1000; // 10 minutes
const TTL_STATIC_MS = 24 * 60 * 60 * 1000; // 24 hours

// Canonical slug = PandaScore videogame slug, except the four legacy
// short slugs (lol/csgo/dota2/valorant) which predate the wider game list.
const GAMES = [
  'lol',
  'csgo',
  'dota2',
  'valorant',
  'ow',
  'r6-siege',
  'rl',
  'pubg',
  'mlbb',
  'kog',
  'starcraft-2',
  'codmw',
];

// PandaScore videogame slugs → our canonical slugs
const SLUG_MAP = {
  'league-of-legends': 'lol',
  'cs-go': 'csgo',
  'counter-strike': 'csgo',
  'dota-2': 'dota2',
};

// canonical slug → PandaScore API path segment (identity unless mapped)
const PATH_MAP = {
  'r6-siege': 'r6siege',
};

function normalizeGame(slug, fallback) {
  if (!slug) return fallback ?? 'unknown';
  return SLUG_MAP[slug] ?? (GAMES.includes(slug) ? slug : fallback ?? slug);
}

const client = axios.create({
  baseURL: config.pandascoreBaseUrl,
  timeout: 10_000,
  headers: { Authorization: `Bearer ${config.pandascoreApiKey}` },
});

// ---------- upsert helpers ----------

async function upsertTeam(raw, game) {
  if (!raw?.id) return null;
  return prisma.team.upsert({
    where: { pandascoreId: raw.id },
    update: {
      name: raw.name,
      acronym: raw.acronym ?? null,
      imageUrl: raw.image_url ?? null,
      game: normalizeGame(raw.current_videogame?.slug, game),
      fetchedAt: new Date(),
    },
    create: {
      pandascoreId: raw.id,
      name: raw.name,
      acronym: raw.acronym ?? null,
      imageUrl: raw.image_url ?? null,
      game: normalizeGame(raw.current_videogame?.slug, game),
    },
  });
}

async function upsertPlayer(raw, teamDbId) {
  if (!raw?.id) return null;
  const data = {
    name: raw.name,
    firstName: raw.first_name ?? null,
    lastName: raw.last_name ?? null,
    role: raw.role ?? null,
    nationality: raw.nationality ?? null,
    imageUrl: raw.image_url ?? null,
    teamId: teamDbId ?? null,
    fetchedAt: new Date(),
  };
  return prisma.player.upsert({
    where: { pandascoreId: raw.id },
    update: data,
    create: { pandascoreId: raw.id, ...data },
  });
}

async function upsertTournament(raw, game) {
  if (!raw?.id) return null;
  const data = {
    name: raw.league?.name ? `${raw.league.name} ${raw.name}` : raw.name,
    game: normalizeGame(raw.videogame?.slug, game),
    tier: raw.tier ?? null,
    prizePool: raw.prizepool ?? null,
    beginAt: raw.begin_at ? new Date(raw.begin_at) : null,
    endAt: raw.end_at ? new Date(raw.end_at) : null,
    fetchedAt: new Date(),
  };
  return prisma.tournament.upsert({
    where: { pandascoreId: raw.id },
    update: data,
    create: { pandascoreId: raw.id, ...data },
  });
}

async function upsertMatch(raw, game) {
  if (!raw?.id) return null;
  const [opp1, opp2] = raw.opponents ?? [];
  const team1 = await upsertTeam(opp1?.opponent, game);
  const team2 = await upsertTeam(opp2?.opponent, game);
  const tournament = raw.tournament ? await upsertTournament(raw.tournament, game) : null;

  // results[] is NOT ordered like opponents[] — pair scores by team_id
  const results = raw.results ?? [];
  const res1 = results.find((r) => r.team_id === opp1?.opponent?.id);
  const res2 = results.find((r) => r.team_id === opp2?.opponent?.id);
  const data = {
    name: raw.name ?? `${team1?.name ?? 'TBD'} vs ${team2?.name ?? 'TBD'}`,
    game: normalizeGame(raw.videogame?.slug, game),
    status: raw.status ?? 'not_started',
    startTime: raw.begin_at ? new Date(raw.begin_at) : null,
    team1Id: team1?.id ?? null,
    team2Id: team2?.id ?? null,
    score1: res1?.score ?? null,
    score2: res2?.score ?? null,
    tournamentId: tournament?.id ?? null,
    fetchedAt: new Date(),
  };
  return prisma.match.upsert({
    where: { pandascoreId: raw.id },
    update: data,
    create: { pandascoreId: raw.id, ...data },
  });
}

// ---------- freshness ----------
// Freshness is tracked per full-list sync (SyncMeta), never inferred from
// row timestamps — single-row upserts (searches, match syncs) would
// otherwise make a never-synced list look fresh.

async function metaFresh(key, ttlMs) {
  const meta = await prisma.syncMeta.findUnique({ where: { key } });
  return meta !== null && Date.now() - meta.syncedAt.getTime() < ttlMs;
}

async function setMeta(key) {
  const syncedAt = new Date();
  await prisma.syncMeta.upsert({ where: { key }, update: { syncedAt }, create: { key, syncedAt } });
}

function gamePath(game) {
  return GAMES.includes(game) ? `/${PATH_MAP[game] ?? game}` : '';
}

// ---------- sync functions (DB-first, graceful fallback) ----------

export async function syncTeams(game, search, page = 1) {
  try {
    const key = `teams:${game || 'all'}:page:${page}`;
    if (!search && (await metaFresh(key, TTL_STATIC_MS))) return;
    const params = { per_page: 50, page, ...(search ? { 'search[name]': search } : {}) };
    const { data } = await client.get(`${gamePath(game)}/teams`, { params });
    for (const t of data) await upsertTeam(t, game ?? normalizeGame(t.current_videogame?.slug));
    if (!search) await setMeta(key);
  } catch (err) {
    console.error('[pandascore] syncTeams failed:', err.message);
  }
}

export async function syncTeamDetail(pandascoreId) {
  try {
    const { data } = await client.get(`/teams/${pandascoreId}`);
    const team = await upsertTeam(data, normalizeGame(data.current_videogame?.slug));
    for (const p of data.players ?? []) await upsertPlayer(p, team.id);
    return team;
  } catch (err) {
    console.error('[pandascore] syncTeamDetail failed:', err.message);
    return null;
  }
}

export async function syncMatches(status, game) {
  // status: 'upcoming' | 'running' | 'past'
  try {
    const key = `matches:${status}:${game || 'all'}`;
    if (await metaFresh(key, TTL_MATCHES_MS)) return;
    const { data } = await client.get(`${gamePath(game)}/matches/${status}`, {
      params: { per_page: 50 },
    });
    for (const m of data) await upsertMatch(m, game ?? normalizeGame(m.videogame?.slug));
    await setMeta(key);
  } catch (err) {
    console.error('[pandascore] syncMatches failed:', err.message);
  }
}

export async function syncMatchDetail(matchDbId) {
  const existing = await prisma.match.findUnique({ where: { id: matchDbId } });
  if (!existing) return null;

  // Finished matches with detail cached never need a refetch;
  // live matches refresh every 2 minutes, others follow the normal TTL.
  if (existing.status === 'finished' && existing.detailFetchedAt) return existing;
  const ttl = existing.status === 'running' ? 2 * 60 * 1000 : TTL_MATCHES_MS;
  if (existing.detailFetchedAt && Date.now() - existing.detailFetchedAt.getTime() < ttl) {
    return existing;
  }

  try {
    const { data } = await client.get(`/matches/${existing.pandascoreId}`);
    await upsertMatch(data, existing.game);
    return await prisma.match.update({
      where: { id: matchDbId },
      data: {
        streams: (data.streams_list ?? []).map((s) => ({
          embed_url: s.embed_url ?? null,
          raw_url: s.raw_url ?? null,
          language: s.language ?? null,
          official: s.official ?? false,
        })),
        mapGames: (data.games ?? []).map((g) => ({
          position: g.position,
          status: g.status,
          length: g.length ?? null,
          winnerPandascoreId: g.winner?.id ?? null,
          forfeit: g.forfeit ?? false,
        })),
        detailFetchedAt: new Date(),
      },
    });
  } catch (err) {
    console.error('[pandascore] syncMatchDetail failed:', err.message);
    return existing;
  }
}

// Brackets come as a flat match list linked by previous_matches;
// a match's round = 1 + the deepest round among its ancestors in the set.
function computeRounds(bracketMatches) {
  const byId = new Map(bracketMatches.map((m) => [m.id, m]));
  const rounds = new Map();

  function round(m) {
    if (rounds.has(m.id)) return rounds.get(m.id);
    rounds.set(m.id, 1); // guard against cycles
    const prev = (m.previous_matches ?? [])
      .map((p) => byId.get(p.match_id))
      .filter(Boolean);
    const r = prev.length === 0 ? 1 : 1 + Math.max(...prev.map(round));
    rounds.set(m.id, r);
    return r;
  }

  bracketMatches.forEach(round);
  return rounds;
}

export async function syncTournamentDetail(tournamentDbId) {
  const existing = await prisma.tournament.findUnique({ where: { id: tournamentDbId } });
  if (!existing) return null;

  const over = existing.endAt && existing.endAt.getTime() < Date.now();
  const ttl = over ? TTL_STATIC_MS : TTL_MATCHES_MS;
  if (existing.detailFetchedAt && Date.now() - existing.detailFetchedAt.getTime() < ttl) {
    return existing;
  }

  let standings = existing.standings ?? [];
  let brackets = existing.brackets ?? [];

  try {
    const { data } = await client.get(`/tournaments/${existing.pandascoreId}/standings`);
    standings = data.map((s) => ({
      rank: s.rank,
      wins: s.wins ?? null,
      losses: s.losses ?? null,
      team: s.team
        ? { pandascoreId: s.team.id, name: s.team.name, acronym: s.team.acronym, imageUrl: s.team.image_url }
        : null,
    }));
  } catch (err) {
    console.error('[pandascore] standings failed:', err.message);
  }

  try {
    const { data } = await client.get(`/tournaments/${existing.pandascoreId}/brackets`);
    const rounds = computeRounds(data);
    brackets = data
      .map((m) => ({
        pandascoreId: m.id,
        name: m.name,
        round: rounds.get(m.id) ?? 1,
        status: m.status,
        beginAt: m.begin_at ?? null,
        opponents: (m.opponents ?? []).map((o) => ({
          pandascoreId: o.opponent?.id ?? null,
          name: o.opponent?.name ?? 'TBD',
          acronym: o.opponent?.acronym ?? null,
          imageUrl: o.opponent?.image_url ?? null,
          // pair by team_id — results[] order is independent of opponents[]
          score: (m.results ?? []).find((r) => r.team_id === o.opponent?.id)?.score ?? null,
          winner: m.winner_id != null && o.opponent?.id === m.winner_id,
        })),
      }))
      .sort((a, b) => a.round - b.round || (a.beginAt ?? '').localeCompare(b.beginAt ?? ''));
  } catch (err) {
    console.error('[pandascore] brackets failed:', err.message);
  }

  return prisma.tournament.update({
    where: { id: tournamentDbId },
    data: { standings, brackets, detailFetchedAt: new Date() },
  });
}

export async function syncTournaments(game, search) {
  try {
    const key = `tournaments:${game || 'all'}`;
    if (!search && (await metaFresh(key, TTL_STATIC_MS))) return;
    const params = { per_page: 50, ...(search ? { 'search[name]': search } : {}) };
    const { data } = await client.get(`${gamePath(game)}/tournaments`, { params });
    for (const t of data) await upsertTournament(t, game ?? normalizeGame(t.videogame?.slug));
    if (!search) await setMeta(key);
  } catch (err) {
    console.error('[pandascore] syncTournaments failed:', err.message);
  }
}
