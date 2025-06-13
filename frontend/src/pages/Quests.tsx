import { useState } from 'react';
import FilterBar from '../components/ui/FilterBar';
import QuestGrid from '../components/ui/QuestGrid';

import type { QuestStatus, QuestType } from '../components/ui/QuestCard';
import { useGetQuests } from '../hooks/useGetQuests';

export type TypeFilter = 'all' | QuestType;
export type StatusFilter = 'all' | QuestStatus;

export default function QuestsPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { quests, isLoading } = useGetQuests(typeFilter, statusFilter);

  return (
    <div className="px-6 pb-6 pt-16">
      <FilterBar
        selectedType={typeFilter}
        onTypeChange={setTypeFilter}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <QuestGrid quests={quests} isLoading={isLoading} />
    </div>
  );
}
