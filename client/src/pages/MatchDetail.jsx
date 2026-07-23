import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, gameLabel } from '../lib/api';
import TeamLogo from '../components/TeamLogo';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

function formatLength(seconds) {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function formatTime(iso) {
  if (!iso) return 'TBD';
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StreamEmbed({ streams, live }) {
  const twitch = live
    ? (streams ?? []).find((s) => s.embed_url?.includes('player.twitch.tv'))
    : null;
  const others = (streams ?? []).filter((s) => s !== twitch && s.raw_url);

  if (!twitch && others.length === 0) return null;

  return (
    <section>
      <h2 className="section-title mb-4">Watch</h2>
      {twitch ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-tide">
          <iframe
            title="Live stream"
            src={`${twitch.embed_url}&parent=${window.location.hostname}&autoplay=false`}
            allowFullScreen
            className="aspect-video w-full"
          />
        </div>
      ) : null}
      {others.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((s) => (
            <a
              key={s.raw_url}
              href={s.raw_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide hover:border-current hover:text-current dark:border-tide"
            >
              Stream{s.language ? ` (${s.language})` : ''} ↗
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function MapBreakdown({ match }) {
  const games = match.mapGames ?? [];
  if (games.length === 0) return null;

  function winnerTeam(g) {
    if (g.winnerPandascoreId === match.team1?.pandascoreId) return match.team1;
    if (g.winnerPandascoreId === match.team2?.pandascoreId) return match.team2;
    return null;
  }

  return (
    <section>
      <h2 className="section-title mb-4">
        Map by map
      </h2>
      <div className="card divide-y divide-slate-200 dark:divide-tide">
        {games.map((g) => {
          const winner = winnerTeam(g);
          return (
            <div key={g.position} className="flex items-center gap-4 px-4 py-3">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                MAP {g.position}
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {winner ? (
                  <>
                    <TeamLogo team={winner} size="h-6 w-6" />
                    <span className="truncate text-sm font-semibold">{winner.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {g.forfeit ? 'wins by forfeit' : 'wins'}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {g.status === 'running' ? 'In progress…' : 'Not played yet'}
                  </span>
                )}
              </div>
              <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {formatLength(g.length)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/matches/${id}`)
      .then((r) => setMatch(r.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <EmptyState title="Match not found" />;
  if (!match) return <Spinner />;

  const live = match.status === 'running';
  const finished = match.status === 'finished';

  return (
    <div className="space-y-8">
      <div className="card px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <span>
            {gameLabel(match.game)}
            {match.tournament && (
              <>
                {' · '}
                <Link to={`/tournaments/${match.tournament.id}`} className="hover:text-current">
                  {match.tournament.name}
                </Link>
              </>
            )}
          </span>
          {live ? (
            <span className="flex items-center gap-1.5 font-bold text-signal">
              <span className="live-dot" /> LIVE
            </span>
          ) : (
            <span className="font-mono">{finished ? 'Final' : formatTime(match.startTime)}</span>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {[match.team1, match.team2].map((team, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-3 ${team ? '' : 'opacity-50'}`}
            >
              <TeamLogo team={team} size="h-16 w-16 md:h-24 md:w-24" />
              {team ? (
                <Link
                  to={`/teams/${team.id}`}
                  className="text-center font-display text-xl font-semibold uppercase tracking-wide hover:text-current md:text-2xl"
                >
                  {team.name}
                </Link>
              ) : (
                <span className="font-display text-xl uppercase">TBD</span>
              )}
            </div>
          ))}

          <div className="col-start-2 row-start-1 text-center">
            {live || finished ? (
              <span className="font-mono text-4xl font-bold tabular-nums md:text-6xl">
                {match.score1 ?? 0}
                <span className="mx-2 inline-block -skew-x-12 text-slate-400">/</span>
                {match.score2 ?? 0}
              </span>
            ) : (
              <span className="font-mono text-2xl text-slate-400">vs</span>
            )}
          </div>
        </div>
      </div>

      <StreamEmbed streams={match.streams} live={live} />
      <MapBreakdown match={match} />
    </div>
  );
}
