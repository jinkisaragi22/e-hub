import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import MatchCard from '../components/MatchCard';
import GameFilter from '../components/GameFilter';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'running', label: 'Live' },
  { key: 'finished', label: 'Results' },
];

export default function Matches() {
  const [status, setStatus] = useState('upcoming');
  const [game, setGame] = useState('');
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    setMatches(null);
    api
      .get('/matches', { params: { status, ...(game ? { game } : {}) } })
      .then((r) => setMatches(r.data))
      .catch(() => setMatches([]));
  }, [status, game]);

  return (
    <div className="space-y-6">
      <h1 className="page-title">Matches</h1>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex rounded-md border border-slate-300 p-0.5 dark:border-tide">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setStatus(t.key)}
              className={`rounded px-4 py-1.5 text-sm font-semibold ${
                status === t.key
                  ? 'bg-current text-abyss'
                  : 'text-slate-600 hover:text-current dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <GameFilter value={game} onChange={setGame} />
      </div>

      {matches === null ? (
        <Spinner />
      ) : matches.length === 0 ? (
        <EmptyState
          title="No matches found"
          hint="Try a different game or status — or the cache may still be warming up."
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {matches.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}
