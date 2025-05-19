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
  solved: 'bg-status-solved/20 text-status-solved',
};

export default function FilterBar({
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
}: FilterBarProps) {
  // const factory = RIDDLE_FACTORY_ADDRESS;

  // const { submit, status: submitStatus } = useSubmitNewQuest();

  // const [isHovering, setIsHovering] = useState(false);

  // // New state for quest submission form
  // const [newQuestRiddle, setNewQuestRiddle] = useState('');
  // const [newQuestAnswer, setNewQuestAnswer] = useState('');
  // const [newQuestBounty, setNewQuestBounty] = useState(0);
  // Handle quest submission
  // const handleSubmitQuest = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!newQuestAnswer.trim()) return;
  //   try {
  //     await submit({
  //       riddle: newQuestRiddle,
  //       answer: newQuestAnswer,
  //       bounty: newQuestBounty,
  //       contractAddress: factory,
  //     });
  //     setNewQuestRiddle('');
  //     setNewQuestAnswer('');
  //     setNewQuestBounty(0);
  //   } catch {
  //     /* toast handled by hook */
  //   }
  // };

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

      {/* <div>
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="flex  text-sm font-medium"
          >
            Submit new Quest
          </button>

          {isHovering &&
            submitStatus !== 'generating_proof' &&
            submitStatus !== 'submitting_proof' &&
            submitStatus !== 'confirming_tx' && (
              <div
                className="w-[500px] bg-[#1A103D] p-6 rounded-lg border border-[#AD14DB]/30 absolute left-0 top-full z-50"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}>
                <h3 className="text-xl font-medium text-white mb-4">
                  Submit a New Riddle
                </h3>
                <form onSubmit={handleSubmitQuest}>
                  <div className="mb-6">
                    <label
                      htmlFor="quest-riddle"
                      className="block text-sm font-medium text-white/80 mb-1">
                      Riddle
                    </label>
                    <textarea
                      id="quest-riddle"
                      value={newQuestRiddle}
                      onChange={(e) => setNewQuestRiddle(e.target.value)}
                      className="w-full bg-[#2C1F56] border border-[#AD14DB]/30 rounded-md px-4 py-2 text-white min-h-[120px]"
                      placeholder="Enter the new riddle text"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="quest-riddle"
                      className="block text-sm font-medium text-white/80 mb-1">
                      Answer
                    </label>
                    <textarea
                      id="quest-answer"
                      value={newQuestAnswer}
                      onChange={(e) => setNewQuestAnswer(e.target.value)}
                      className="w-full bg-[#2C1F56] border border-[#AD14DB]/30 rounded-md px-4 py-2 text-white min-h-[120px]"
                      placeholder="Enter the asnwer, must be up to a 6 letter word"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="quest-riddle"
                      className="block text-sm font-medium text-white/80 mb-1">
                      Bounty (ETH)
                    </label>
                    <input
                      id="quest-bounty"
                      type="number"
                      value={newQuestBounty}
                      onChange={(e) =>
                        setNewQuestBounty(Number(e.target.value))
                      }
                      className="w-full bg-[#2C1F56] border border-[#AD14DB]/30 rounded-md px-4 py-2 text-white "
                      placeholder="Enter the bounty"
                      min="1e-9"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={
                        !newQuestRiddle.trim() ||
                        !newQuestAnswer.trim() ||
                        submitStatus in
                          [
                            'generating_proof',
                            'submitting_proof',
                            'confirming_tx',
                          ]
                      }
                      className="px-4 py-2 bg-[#AD14DB] text-white rounded-md hover:bg-[#8E10B4] transition-colors disabled:opacity-50">
                      {submitStatus in
                      ['generating_proof', 'submitting_proof', 'confirming_tx']
                        ? 'Submitting Quest...'
                        : 'Submit Quest'}
                    </button>
                  </div>
                </form>
              </div>
            )}
        </div>
      </div> */}

      {/* Status toggle---- */}
      <div className="flex gap-2 text-xs uppercase tracking-wide">
        {statusButtons.map(({ value, label }) => {
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
    </section>
  );
}
