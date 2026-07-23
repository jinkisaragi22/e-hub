import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import MatchCard from '../components/MatchCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

export default function Home() {
  const [live, setLive] = useState(null);
  const [upcoming, setUpcoming] = useState(null);
  const [tournaments, setTournaments] = useState(null);

  useEffect(() => {
    api.get('/matches', { params: { status: 'running' } }).then((r) => setLive(r.data)).catch(() => setLive([]));
    api.get('/matches', { params: { status: 'upcoming' } }).then((r) => setUpcoming(r.data)).catch(() => setUpcoming([]));
    api.get('/tournaments').then((r) => setTournaments(r.data)).catch(() => setTournaments([]));
  }, []);

  const loading = live === null || upcoming === null || tournaments === null;

  return (
    <div className="space-y-12">
      <section className="hero-glow -mx-4 px-4 pb-12 pt-10 text-center md:pt-16">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-current">
          // Live esports coverage
        </p>
        <h1 className="font-display text-5xl font-bold uppercase italic leading-none tracking-tight md:text-7xl">
          Every match.
          <br />
          <span className="text-current drop-shadow-[0_0_24px_rgba(255,93,31,0.45)]">
            One hub.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-600 md:text-base dark:text-slate-400">
          Live scores, schedules, teams and tournaments across League of Legends, CS2, Dota 2 and
          Valorant — in one place.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/matches"
            className="btn-angled bg-current px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-abyss hover:opacity-90"
          >
            <span>Browse matches</span>
          </Link>
          <Link
            to="/teams"
            className="btn-angled border border-slate-300 px-6 py-2.5 text-sm font-bold uppercase tracking-wide hover:border-current hover:text-current dark:border-tide"
          >
            <span>Find your team</span>
          </Link>
        </div>
      </section>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {live.length > 0 && (
            <section>
              <h2 className="section-title mb-4">
                <span className="live-dot" /> Live now
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {live.slice(0, 6).map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="section-title mb-4">
              Upcoming matches
            </h2>
            {upcoming.length === 0 ? (
              <EmptyState
                title="No upcoming matches cached"
                hint="Check that the server is running with a valid PandaScore API key."
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {upcoming.slice(0, 6).map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            )}
            <div className="mt-4 text-right">
              <Link to="/matches" className="text-sm text-current hover:underline">
                All matches →
              </Link>
            </div>
          </section>

          <section>
            <h2 className="section-title mb-4">
              Featured tournaments
            </h2>
            {tournaments.length === 0 ? (
              <EmptyState title="No tournaments cached yet" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tournaments.slice(0, 6).map((t) => (
                  <Link
                    key={t.id}
                    to={`/tournaments/${t.id}`}
                    className="card px-4 py-4 transition-colors hover:border-current dark:hover:border-current"
                  >
                    <p className="truncate font-semibold">{t.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      {t.game}
                      {t.prizePool ? ` · ${t.prizePool}` : ''}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
