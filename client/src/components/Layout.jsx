import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-5 text-center dark:border-tide">
        <p className="font-display text-sm font-semibold uppercase italic tracking-widest text-slate-400 dark:text-slate-500">
          e<span className="text-current">//</span>hub
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-600">
          Data by PandaScore
        </p>
      </footer>
    </div>
  );
}
