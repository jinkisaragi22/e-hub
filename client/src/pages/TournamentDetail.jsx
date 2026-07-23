import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, gameLabel } from '../lib/api';
import MatchCard from '../components/MatchCard';
import TeamLogo from '../components/TeamLogo';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

function Standings({ standings }) {
  if (!standings?.length) return null;
  return (
    <section>
      <h2 className="section-title mb-4">
        Standings
      </h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-tide dark:text-slate-400">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-right">W</th>
              <th className="px-4 py-3 text-right">L</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => (
              <tr
                key={s.rank + (s.team?.name ?? '')}
                className="border-b border-slate-100 last:border-0 dark:border-tide/50"
              >
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                  {s.rank}
                </td>
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2 font-semibold">
                    <TeamLogo team={s.team} size="h-6 w-6" />
                    {s.team?.name ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums">{s.wins ?? '—'}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {s.losses ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// "Quarterfinal 3: TY vs TS" → "Quarterfinal 3"
function bracketMatchLabel(name) {
  if (!name) return null;
  const i = name.indexOf(':');
  return i > 0 ? name.slice(0, i) : name;
}

function BracketMatch({ match }) {
  const live = match.status === 'running';
  const label = bracketMatchLabel(match.name);
  return (
    <div className={`card px-3 py-2 ${live ? 'border-signal/60 dark:border-signal/60' : ''}`}>
      {(label || live) && (
        <p className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span className="truncate">{label}</span>
          {live && (
            <span className="flex shrink-0 items-center gap-1 text-signal">
              <span className="live-dot" /> LIVE
            </span>
          )}
        </p>
      )}
      {match.opponents.length === 0 ? (
        <p className="py-1 text-center text-xs text-slate-400">TBD</p>
      ) : (
        match.opponents.map((o, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 py-1 ${
              match.status === 'finished' && !o.winner ? 'opacity-45' : ''
            }`}
          >
            <TeamLogo team={o} size="h-5 w-5" />
            <span
              className={`min-w-0 flex-1 truncate text-xs ${
                o.winner ? 'font-bold text-current' : 'font-semibold'
              }`}
            >
              {o.name}
            </span>
            <span
              className={`font-mono text-xs tabular-nums ${o.winner ? 'font-bold text-current' : ''}`}
            >
              {o.score ?? '–'}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

function Bracket({ brackets }) {
  if (!brackets?.length) return null;
  const rounds = [...new Set(brackets.map((b) => b.round))].sort((a, b) => a - b);
  // A single flat round is a league schedule, not a playoff tree — the
  // "Matches & results" section already covers it.
  if (rounds.length < 2) return null;

  // Order matches inside a round by their own name (natural sort puts
  // "Quarterfinal 1" before "Quarterfinal 3"), then by start time.
  function roundMatches(r) {
    return brackets
      .filter((b) => b.round === r)
      .sort(
        (a, b) =>
          (a.name ?? '').localeCompare(b.name ?? '', undefined, { numeric: true }) ||
          (a.beginAt ?? '').localeCompare(b.beginAt ?? ''),
      );
  }

  return (
    <section>
      <h2 className="section-title mb-4">Bracket</h2>
      <div className="overflow-x-auto pb-2">
        <div className="flex items-stretch gap-6" style={{ minWidth: rounds.length * 260 }}>
          {rounds.map((r) => (
            <div key={r} className="flex w-60 shrink-0 flex-col">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Round {r}
              </p>
              <div className="flex flex-1 flex-col justify-around gap-3">
                {roundMatches(r).map((b) => (
                  <BracketMatch key={b.pandascoreId} match={b} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function TournamentDetail() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/tournaments/${id}`)
      .then((r) => setTournament(r.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <EmptyState title="Tournament not found" />;
  if (!tournament) return <Spinner />;

  return (
    <div className="space-y-8">
      <div className="card px-6 py-6">
        <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {gameLabel(tournament.game)}
          {tournament.tier ? ` · Tier ${tournament.tier.toUpperCase()}` : ''}
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold uppercase italic tracking-wide">
          {tournament.name}
        </h1>
        {tournament.prizePool && (
          <p className="mt-2 font-mono text-sm text-current">{tournament.prizePool}</p>
        )}
      </div>

      <Standings standings={tournament.standings} />
      <Bracket brackets={tournament.brackets} />

      <section>
        <h2 className="section-title mb-4">
          Matches &amp; results
        </h2>
        {tournament.matches.length === 0 ? (
          <EmptyState title="No matches cached for this tournament yet" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {tournament.matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
