import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/matches', label: 'Matches' },
  { to: '/tournaments', label: 'Tournaments' },
  { to: '/teams', label: 'Teams' },
];

function navClass({ isActive }) {
  return `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isActive
      ? 'text-current bg-current/10'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-foam'
  }`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-tide dark:bg-abyss/90">
      <div className="h-0.5 bg-gradient-to-r from-current via-current/30 to-transparent" />
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link to="/" className="font-display text-2xl font-bold uppercase italic tracking-wide">
          e<span className="text-current">//</span>hub
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass}>
              {l.label}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/favorites" className={navClass}>
              ★ Favorites
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-depth"
          >
            {dark ? '☀' : '☾'}
          </button>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="max-w-40 truncate text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-tide dark:hover:bg-depth"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-foam"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-current px-3 py-1.5 text-sm font-semibold text-abyss hover:opacity-90"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="rounded-md p-2 md:hidden"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden dark:border-tide">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/favorites" className={navClass} onClick={() => setOpen(false)}>
                ★ Favorites
              </NavLink>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                  navigate('/');
                }}
                className="px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-400"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass} onClick={() => setOpen(false)}>
                Log in
              </NavLink>
              <NavLink to="/register" className={navClass} onClick={() => setOpen(false)}>
                Sign up
              </NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
