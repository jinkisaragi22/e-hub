export default function TeamLogo({ team, size = 'h-10 w-10' }) {
  if (team?.imageUrl) {
    return (
      <img
        src={team.imageUrl}
        alt={team.name}
        className={`${size} shrink-0 object-contain`}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`${size} flex shrink-0 items-center justify-center rounded bg-slate-200 font-display text-sm font-bold uppercase text-slate-500 dark:bg-tide dark:text-slate-400`}
    >
      {(team?.acronym ?? team?.name ?? '?').slice(0, 3)}
    </div>
  );
}
