import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

export default function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/players/${id}`)
      .then((r) => setPlayer(r.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) return <EmptyState title="Player not found" />;
  if (!player) return <Spinner />;

  const fullName = [player.firstName, player.lastName].filter(Boolean).join(' ');

  return (
    <div className="card mx-auto max-w-2xl px-8 py-10 text-center">
      {player.imageUrl ? (
        <img
          src={player.imageUrl}
          alt={player.name}
          className="mx-auto h-40 w-40 rounded-full object-cover object-top"
        />
      ) : (
        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-slate-200 font-display text-5xl dark:bg-tide">
          {player.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <h1 className="mt-6 font-display text-4xl font-bold uppercase tracking-wide">{player.name}</h1>
      {fullName && <p className="mt-1 text-slate-500 dark:text-slate-400">{fullName}</p>}

      <dl className="mt-8 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</dt>
          <dd className="mt-1 font-semibold">{player.role ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Nationality
          </dt>
          <dd className="mt-1 font-semibold">{player.nationality ?? '—'}</dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Team</dt>
          <dd className="mt-1 font-semibold">
            {player.team ? (
              <Link to={`/teams/${player.team.id}`} className="text-current hover:underline">
                {player.team.name}
              </Link>
            ) : (
              'Free agent'
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
