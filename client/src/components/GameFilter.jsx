import { GAMES } from '../lib/api';

export default function GameFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {GAMES.map((g) => (
        <button
          key={g.slug}
          onClick={() => onChange(g.slug)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
            value === g.slug
              ? 'bg-current text-abyss'
              : 'border border-slate-300 text-slate-600 hover:border-current hover:text-current dark:border-tide dark:text-slate-400'
          }`}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}
