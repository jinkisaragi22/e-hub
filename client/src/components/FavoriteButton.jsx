import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function FavoriteButton({ teamId }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    api
      .get('/favorites')
      .then((res) => setIsFavorite(res.data.some((t) => t.id === teamId)))
      .catch(() => {});
  }, [user, teamId]);

  async function toggle() {
    if (!user) {
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${teamId}`);
        setIsFavorite(false);
      } else {
        await api.post('/favorites', { teamId });
        setIsFavorite(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
        isFavorite
          ? 'border-current bg-current/10 text-current'
          : 'border-slate-300 text-slate-600 hover:border-current hover:text-current dark:border-tide dark:text-slate-400'
      }`}
    >
      <span aria-hidden>{isFavorite ? '★' : '☆'}</span>
      {isFavorite ? 'Favorited' : 'Add to favorites'}
    </button>
  );
}
