import { useState } from 'react';
import FilterBar from '../components/ui/FilterBar';
import QuestGrid, { type Quest } from '../components/ui/QuestGrid';

const ALL_QUESTS: Quest[] = [
  {
    id: 1,
    type: 'riddle',
    status: 'open',
    title: 'The Sphinx’s Cipher',
    excerpt: 'Solve the riddle to unlock the DAO’s secret vault key.',
  },
  {
    id: 2,
    type: 'vote',
    status: 'closed',
    title: 'Launch‑Day Logo Choice',
    excerpt: 'Pick the final branding for our zk‑powered wallet.',
  },
];

export default function QuestsPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'riddle' | 'vote'>(
    'all'
  );
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'open' | 'closed' | 'completed'
  >('all');

  const visibleQuests = ALL_QUESTS.filter((q) => {
    const typePass = typeFilter === 'all' || q.type === typeFilter;
    const statusPass = statusFilter === 'all' || q.status === statusFilter;
    return typePass && statusPass;
  });

  return (
    <div className="p-6">
      <FilterBar
        selectedType={typeFilter}
        onTypeChange={setTypeFilter}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <QuestGrid quests={visibleQuests} />
    </div>
  );
}
