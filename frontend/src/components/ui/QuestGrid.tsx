import QuestCard, { type QuestType, type QuestStatus } from './QuestCard';
import { Spinner } from './Spinner';

export interface Quest {
  id: number;
  solutionHash: string;
  type: QuestType;
  status: QuestStatus;
  bounty: bigint;
  riddle: string;
  title: string;
  excerpt: string;
}

interface QuestGridProps {
  quests: Quest[];
  isLoading: boolean;
  baseHref?: string;
  emptyMessage?: string;
}

export default function QuestGrid({
  quests,
  isLoading,
  baseHref = '/quests',
  emptyMessage = 'No quests found.',
}: QuestGridProps) {
  if (quests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-20 text-white/70">
        <span className="text-4xl">🪄</span>
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  if (isLoading) {
    <div className="flex flex-col items-center gap-2 py-20 text-white/70">
      <Spinner />
    </div>;
  }

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {quests.map((q) => (
        <QuestCard
          key={q.id}
          href={`${baseHref}/${q.id}`}
          type={q.type}
          status={q.status}
          title={q.title}
          excerpt={q.excerpt}
        />
      ))}
    </section>
  );
}
