export default function EmptyState({ title = 'Nothing here yet', hint }) {
  return (
    <div className="card px-6 py-16 text-center">
      <p className="font-display text-xl uppercase italic tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </p>
      {hint && <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">{hint}</p>}
    </div>
  );
}
