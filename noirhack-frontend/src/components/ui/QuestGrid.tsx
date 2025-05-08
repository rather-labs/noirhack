import QuestCard, { type QuestType, type QuestStatus } from './QuestCard';

export interface Quest {
  id: string | number;
  type: QuestType;
  status: QuestStatus;
  title: string;
  excerpt: string;
}

interface QuestGridProps {
  quests: Quest[];
  baseHref?: string;
  emptyMessage?: string;
}

export default function QuestGrid({
  quests,
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
