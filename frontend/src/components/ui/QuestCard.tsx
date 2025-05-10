import { Link } from 'react-router-dom';

export type QuestType = 'riddle' | 'vote';
export type QuestStatus = 'open' | 'closed' | 'completed' | 'solved'; 

export interface QuestCardProps {
  href: string;
  type: QuestType;
  status: QuestStatus;
  title: string;
  excerpt: string;
}

const accent = {
  riddle: {
    ring: 'ring-accent-riddle/30 hover:ring-accent-riddle/60',
    badge: 'bg-accent-riddle/20 text-accent-riddle',
    button: 'bg-accent-riddle hover:bg-accent-riddle/80',
    icon: '🎲',
    label: 'Puzzle',
    cta: 'Submit answer →',
  },
  vote: {
    ring: 'ring-accent-vote/30 hover:ring-accent-vote/60',
    badge: 'bg-accent-vote/20 text-accent-vote',
    button: 'bg-accent-vote hover:bg-accent-vote/80',
    icon: '🗳️',
    label: 'Vote',
    cta: 'Cast vote →',
  },
} as const;

const statusText = {
  open: 'text-status-open',
  closed: 'text-status-closed',
  completed: 'text-status-completed',
  solved: 'text-status-solved',
} as const;

export default function QuestCard({
  href,
  type,
  status,
  title,
  excerpt,
}: QuestCardProps) {
  const a = accent[type];
  const statusClass = statusText[status];

  return (
    <article>
      <Link
        to={href}
        className={`group relative flex flex-col justify-between rounded-2xl p-6
                  backdrop-blur-sm bg-white/5 ring-1 ${a.ring}`}>
        {/* Badge row */}
        <div className="mb-3 flex items-center justify-between text-xs font-semibold">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${a.badge}`}>
            <span aria-hidden>{a.icon}</span>
            {a.label}
          </span>

          <span className={`uppercase tracking-wide ${statusClass}`}>
            {status}
          </span>
        </div>

        {/* Title + excerpt */}
        <h3 className="mb-1 text-lg font-bold">{title}</h3>
        <p className="mb-6 line-clamp-3 text-sm text-white/70">{excerpt}</p>

        {/* CTA */}
        <button
          className={`self-start rounded-full px-4 py-2 text-sm font-medium transition-colors ${a.button}`}>
          {a.cta}
        </button>
      </Link>
    </article>
  );
}
