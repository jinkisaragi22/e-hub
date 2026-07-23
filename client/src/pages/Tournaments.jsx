import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, gameLabel } from '../lib/api';
import GameFilter from '../components/GameFilter';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '?';
}

export default function Tournaments() {
  const [game, setGame] = useState('');
  const [query, setQuery] = useState('');
  const [tournaments, setTournaments] = useState(null);

  useEffect(() => {
    setTournaments(null);
    api
      .get('/tournaments', { params: { ...(game ? { game } : {}), ...(query ? { q: query } : {}) } })
      .then((r) => setTournaments(r.data))
      .catch(() => setTournaments([]));
  }, [game, query]);

  const onSearch = useCallback((q) => setQuery(q), []);

  return (
    <div className="space-y-6">
      <h1 className="page-title">Tournaments</h1>

      <div className="flex flex-wrap items-center gap-4">
        <SearchBar onSearch={onSearch} placeholder="Search tournaments…" />
        <GameFilter value={game} onChange={setGame} />
      </div>

      {tournaments === null ? (
        <Spinner />
      ) : tournaments.length === 0 ? (
        <EmptyState title="No tournaments found" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              to={`/tournaments/${t.id}`}
              className="card px-4 py-4 transition-colors hover:border-current dark:hover:border-current"
            >
              <p className="truncate font-semibold">{t.name}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {gameLabel(t.game)}
                {t.tier ? ` · Tier ${t.tier.toUpperCase()}` : ''}
              </p>
              <p className="mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                {formatDate(t.beginAt)} → {formatDate(t.endAt)}
              </p>
              {t.prizePool && (
                <p className="mt-1 text-xs font-semibold text-current">{t.prizePool}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
