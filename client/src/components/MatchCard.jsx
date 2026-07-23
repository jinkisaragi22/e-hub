import { Link } from 'react-router-dom';
import TeamLogo from './TeamLogo';
import { gameLabel } from '../lib/api';

function formatTime(iso) {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TeamSide({ team, align }) {
  const inner = (
    <div className={`flex items-center gap-3 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <TeamLogo team={team} />
      <span className="truncate text-sm font-semibold">{team?.name ?? 'TBD'}</span>
    </div>
  );
  return team ? (
    <Link
      to={`/teams/${team.id}`}
      className={`min-w-0 flex-1 hover:text-current ${align === 'right' ? 'text-right' : ''}`}
    >
      {inner}
    </Link>
  ) : (
    <div className={`min-w-0 flex-1 text-slate-400 ${align === 'right' ? 'text-right' : ''}`}>{inner}</div>
  );
}

export default function MatchCard({ match }) {
  const live = match.status === 'running';
  const finished = match.status === 'finished';

  return (
    <div
      className={`card relative px-4 py-3 ${
        live ? 'glow-live border-signal/50 dark:border-signal/50' : ''
      }`}
    >
      <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span className="truncate">
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
        {live && (
          <span className="flex items-center gap-1.5 font-bold text-signal">
            <span className="live-dot" /> LIVE
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <TeamSide team={match.team1} />

        <Link
          to={`/matches/${match.id}`}
          className="flex shrink-0 flex-col items-center rounded px-2 py-1 transition-colors hover:bg-slate-100 dark:hover:bg-tide/50"
          title="Match details"
        >
          {live || finished ? (
            <span className="font-mono text-lg font-bold tabular-nums">
              {match.score1 ?? 0}
              <span className="mx-1 inline-block -skew-x-12 text-slate-400">/</span>
              {match.score2 ?? 0}
            </span>
          ) : (
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {formatTime(match.startTime)}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-wider text-slate-400">
            {finished ? 'Final' : 'Details'}
          </span>
        </Link>

        <TeamSide team={match.team2} align="right" />
      </div>
    </div>
  );
}
