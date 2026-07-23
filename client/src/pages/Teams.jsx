import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import TeamCard from '../components/TeamCard';
import GameFilter from '../components/GameFilter';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

export default function Teams() {
  const [game, setGame] = useState('');
  const [query, setQuery] = useState('');
  const [teams, setTeams] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setTeams(null);
    setPage(1);
    api
      .get('/teams', { params: { ...(game ? { game } : {}), ...(query ? { q: query } : {}) } })
      .then((r) => {
        setTeams(r.data.teams);
        setHasMore(r.data.hasMore);
      })
      .catch(() => setTeams([]));
  }, [game, query]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const r = await api.get('/teams', {
        params: { page: next, ...(game ? { game } : {}), ...(query ? { q: query } : {}) },
      });
      setTeams((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        return [...prev, ...r.data.teams.filter((t) => !seen.has(t.id))];
      });
      setHasMore(r.data.hasMore && r.data.teams.length > 0);
      setPage(next);
    } finally {
      setLoadingMore(false);
    }
  }

  const onSearch = useCallback((q) => setQuery(q), []);

  return (
    <div className="space-y-6">
      <h1 className="page-title">Teams</h1>

      <div className="flex flex-wrap items-center gap-4">
        <SearchBar onSearch={onSearch} placeholder="Search teams…" />
        <GameFilter value={game} onChange={setGame} />
      </div>

      {teams === null ? (
        <Spinner />
      ) : teams.length === 0 ? (
        <EmptyState title="No teams found" hint="Try another name or game." />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((t) => (
              <TeamCard key={t.id} team={t} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-md border border-slate-300 px-6 py-2.5 text-sm font-semibold hover:border-current hover:text-current disabled:opacity-50 dark:border-tide"
              >
                {loadingMore ? 'Loading…' : 'Load more teams'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
