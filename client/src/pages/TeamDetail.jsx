import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, gameLabel } from '../lib/api';
import TeamLogo from '../components/TeamLogo';
import MatchCard from '../components/MatchCard';
import FavoriteButton from '../components/FavoriteButton';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

export default function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setTeam(null);
    api
      .get(`/teams/${id}`)
      .then((r) => setTeam(r.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <EmptyState title="Team not found" />;
  if (!team) return <Spinner />;

  return (
    <div className="space-y-8">
      <div className="card flex flex-wrap items-center gap-6 px-6 py-6">
        <TeamLogo team={team} size="h-20 w-20" />
        <div className="min-w-0 flex-1">
          <h1 className="page-title">{team.name}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {team.acronym ? `${team.acronym} · ` : ''}
            {gameLabel(team.game)}
          </p>
        </div>
        <FavoriteButton teamId={team.id} />
      </div>

      {team.divisions?.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Other divisions
          </h2>
          <div className="flex flex-wrap gap-2">
            {team.divisions.map((d) => (
              <Link
                key={d.id}
                to={`/teams/${d.id}`}
                className="flex items-center gap-2 rounded-full border border-slate-300 py-1.5 pl-1.5 pr-3 text-sm transition-colors hover:border-current hover:text-current dark:border-tide"
              >
                <TeamLogo team={d} size="h-6 w-6" />
                <span className="font-semibold">{d.name}</span>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {gameLabel(d.game)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title mb-4">Roster</h2>
        {team.players.length === 0 ? (
          <EmptyState title="No roster data" hint="PandaScore has no players cached for this team." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {team.players.map((p) => (
              <Link
                key={p.id}
                to={`/players/${p.id}`}
                className="card px-4 py-4 text-center transition-colors hover:border-current dark:hover:border-current"
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="mx-auto h-20 w-20 rounded-full object-cover object-top"
                    loading="lazy"
                  />
                ) : (
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 font-display text-2xl dark:bg-tide">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <p className="mt-3 font-semibold">{p.name}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {p.role ?? 'Player'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title mb-4">
          Recent matches
        </h2>
        {team.recentMatches.length === 0 ? (
          <EmptyState title="No matches cached for this team yet" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {team.recentMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
