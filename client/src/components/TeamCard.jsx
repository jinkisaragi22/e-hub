import { Link } from 'react-router-dom';
import TeamLogo from './TeamLogo';
import { gameLabel } from '../lib/api';

export default function TeamCard({ team }) {
  return (
    <Link
      to={`/teams/${team.id}`}
      className="card flex items-center gap-4 px-4 py-4 transition-colors hover:border-current dark:hover:border-current"
    >
      <TeamLogo team={team} size="h-12 w-12" />
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-semibold uppercase tracking-wide">
          {team.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {team.acronym ? `${team.acronym} · ` : ''}
          {gameLabel(team.game)}
        </p>
      </div>
    </Link>
  );
}
