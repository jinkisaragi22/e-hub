import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import TeamCard from '../components/TeamCard';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

export default function Favorites() {
  const { token } = useAuth();
  const [teams, setTeams] = useState(null);

  useEffect(() => {
    if (!token) return;
    api
      .get('/favorites')
      .then((r) => setTeams(r.data))
      .catch(() => setTeams([]));
  }, [token]);

  if (!token) {
    return (
      <EmptyState
        title="Log in to see your favorites"
        hint="Your starred teams live here once you have an account."
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="page-title">★ Favorites</h1>
      {teams === null ? (
        <Spinner />
      ) : teams.length === 0 ? (
        <EmptyState
          title="No favorite teams yet"
          hint={
            <>
              Browse <Link to="/teams" className="text-current hover:underline">teams</Link> and hit
              the star.
            </>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <TeamCard key={t.id} team={t} />
          ))}
        </div>
      )}
    </div>
  );
}
