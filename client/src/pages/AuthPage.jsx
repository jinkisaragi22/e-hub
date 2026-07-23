import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isRegister) await register(email, password);
      else await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error ?? 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card mx-auto mt-8 max-w-md px-8 py-10">
      <h1 className="font-display text-3xl font-bold uppercase italic tracking-wide">
        {isRegister ? 'Create account' : 'Log in'}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {isRegister ? 'Save your favorite teams and follow their matches.' : 'Welcome back.'}
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-current dark:border-tide dark:bg-abyss"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wide">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-current dark:border-tide dark:bg-abyss"
          />
          {isRegister && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">At least 8 characters.</p>
          )}
        </div>

        {error && <p className="text-sm text-signal">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-current py-2.5 text-sm font-semibold text-abyss hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Please wait…' : isRegister ? 'Sign up' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        {isRegister ? (
          <>
            Already have an account?{' '}
            <Link to="/login" className="text-current hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{' '}
            <Link to="/register" className="text-current hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
