import { IoIosClose } from 'react-icons/io';
import { useCallback, useState, type FormEvent } from 'react';
import type { QuestType, QuestStatus } from './QuestCard';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { useSubmitNewQuest } from '../../hooks/useSubmitNewQuest';

interface FilterBarProps {
  selectedType: 'all' | QuestType;
  onTypeChange: (value: 'all' | QuestType) => void;
  selectedStatus: 'all' | QuestStatus;
  onStatusChange: (value: 'all' | QuestStatus) => void;
}

const buttonTypes: { value: 'all' | QuestType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'riddle', label: 'Riddles' },
  { value: 'vote', label: 'Votes' },
];

const buttonStatuses: { value: 'all' | QuestStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'completed', label: 'Completed' },
];

const statusColors: Record<QuestStatus, string> = {
  open: 'bg-status-open/20 text-status-open',
  closed: 'bg-status-closed/20 text-status-closed',
  solved: 'bg-status-solved/20 text-status-solved',
  completed: 'bg-status-completed/20 text-status-completed',
};

export default function FilterBar({
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
}: FilterBarProps) {
  const { isConnected } = useAccount();
  const { submit: submitNewQuest, reset, status } = useSubmitNewQuest();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = useCallback(() => {
    if (!isConnected) {
      toast.error('Account not connected');
    }

    setIsModalOpen(true);
  }, [isConnected]);

  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!isConnected) {
        toast.error('You must connect your wallet first');
        return;
      }

      const form = e.currentTarget;
      const title = (
        form.elements.namedItem('title') as HTMLInputElement
      ).value.trim();
      const excerpt = (
        form.elements.namedItem('excerpt') as HTMLInputElement
      ).value.trim();
      const riddle = (
        form.elements.namedItem('riddle') as HTMLTextAreaElement
      ).value.trim();
      const answer = (
        form.elements.namedItem('answer') as HTMLInputElement
      ).value.trim();
      const bountyRaw = (form.elements.namedItem('bounty') as HTMLInputElement)
        .value;
      const bounty = parseFloat(bountyRaw);
      if (isNaN(bounty) || bounty <= 0) {
        toast.error('Please enter a valid bounty amount');
        return;
      }

      await submitNewQuest({
        title,
        excerpt,
        riddle,
        answer,
        bounty,
      });
      handleCloseModal();
      form.reset();
      reset();
    },
    [handleCloseModal, reset, isConnected, submitNewQuest]
  );

  return (
    <section
      className="mb-8 flex flex-col gap-4 text-white/90
                 md:flex-row md:items-center md:justify-between">
      {/* Quest‑type toggle */}
      <div className="flex gap-2 text-sm font-medium">
        {buttonTypes.map(({ value, label }) => {
          const isActive = selectedType === value;
          return (
            <button
              type="button"
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
        {/* New Quest Button */}
        <button
          onClick={handleOpenModal}
          className="mr-2 px-2 py-0.5 text-sm cursor-pointer rounded-full text-purple-300 bg-accent-riddle/60 hover:bg-accent-riddle/90">
          {`New Quest  🏹`}
        </button>

        {buttonStatuses.map(({ value, label }) => {
          const isActive = selectedStatus === value;
          const colorClass =
            value !== 'all' ? statusColors[value] : 'bg-white/5';
          return (
            <button
              type="button"
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

      {isModalOpen && isConnected && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-color-black backdrop-blur-sm"
          onClick={handleCloseModal}>
          <div
            className="relative w-full max-w-md rounded-2xl bg-white/10 p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute right-3 top-3 rounded-full p-1 transition hover:bg-white/10">
              <IoIosClose className="h-4 w-4" />
            </button>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <span>
                <label
                  htmlFor="title"
                  className="text-sm font-medium text-white/80 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  className="w-full bg-[#2C1F56] border border-[#AD14DB]/30 rounded-md px-4 py-2 text-white"
                  placeholder="Mystery..."
                  required
                />
              </span>

              <span>
                <label
                  htmlFor="excerpt"
                  className="text-sm font-medium text-white/80 mb-1">
                  Excerpt
                </label>
                <input
                  id="excerpt"
                  className="w-full bg-[#2C1F56] border border-[#AD14DB]/30 rounded-md px-4 py-2 text-white"
                  placeholder="More Mystery..."
                  required
                />
              </span>

              <span>
                <label
                  htmlFor="riddle"
                  className="text-sm font-medium text-white/80 mb-1">
                  Riddle
                </label>
                <textarea
                  id="riddle"
                  className="w-full bg-[#2C1F56] border border-[#AD14DB]/30 rounded-md px-4 py-2 text-white min-h-[100px]"
                  placeholder="Enter the new riddle text"
                  required
                />
              </span>

              <span>
                <label
                  htmlFor="answer"
                  className="text-sm font-medium text-white/80 mb-1">
                  Answer
                </label>
                <input
                  id="answer"
                  className="w-full bg-[#2C1F56] border border-[#AD14DB]/30 rounded-md px-4 py-2 text-white"
                  placeholder="Enter the asnwer, must be up to a 6 letter word"
                  required
                />
              </span>

              <span>
                <label
                  htmlFor="bounty"
                  className="block text-sm font-medium text-white/80 mb-1">
                  Bounty (ETH)
                </label>
                <input
                  id="bounty"
                  className="w-full bg-[#2C1F56] border border-[#AD14DB]/30 rounded-md px-4 py-2 text-white "
                  placeholder="Enter the bounty"
                  required
                />
              </span>

              <button
                type="submit"
                disabled={status !== 'idle'}
                className={`disabled:cursor-default cursor-pointer self-center rounded-full px-8 py-2 text-sm font-medium transition-colors bg-accent-riddle hover:bg-accent-riddle/80`}>
                Create New Quest
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
