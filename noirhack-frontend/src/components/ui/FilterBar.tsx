import type { QuestType, QuestStatus } from './QuestCard';

interface FilterBarProps {
  selectedType: 'all' | QuestType;
  onTypeChange: (value: 'all' | QuestType) => void;
  selectedStatus: 'all' | QuestStatus;
  onStatusChange: (value: 'all' | QuestStatus) => void;
}

const typeButtons: { value: 'all' | QuestType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'riddle', label: 'Riddles' },
  { value: 'vote', label: 'Votes' },
];

const statusButtons: { value: 'all' | QuestStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'completed', label: 'Completed' },
];

const statusColors: Record<QuestStatus, string> = {
  open: 'bg-status-open/20 text-status-open',
  closed: 'bg-status-closed/20 text-status-closed',
  completed: 'bg-status-completed/20 text-status-completed',
};

export default function FilterBar({
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
}: FilterBarProps) {
  return (
    <section
      className="mb-8 flex flex-col gap-4 text-white/90
                 md:flex-row md:items-center md:justify-between">
      {/* Quest‑type toggle */}
      <div className="flex gap-2 text-sm font-medium">
        {typeButtons.map(({ value, label }) => {
          const isActive = selectedType === value;
          return (
            <button
              key={value}
              onClick={() => onTypeChange(value)}
              className={`rounded-full px-3 py-1 transition-colors
                          ${
                            isActive
                              ? 'bg-white/10 font-semibold'
                              : 'hover:bg-white/10'
                          }`}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Status toggle---- */}
      <div className="flex gap-2 text-xs uppercase tracking-wide">
        {statusButtons.map(({ value, label }) => {
          const isActive = selectedStatus === value;
          const colorClass =
            value !== 'all' ? statusColors[value] : 'bg-white/5';
          return (
            <button
              key={value}
              onClick={() => onStatusChange(value)}
              className={`rounded-full px-2 py-0.5 transition-colors
                          ${colorClass}
                          ${
                            isActive
                              ? 'ring-1 ring-white/40'
                              : 'hover:ring-1 hover:ring-white/20'
                          }`}>
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
