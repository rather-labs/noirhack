import { useEffect, useState } from 'react';
import FilterBar from '../components/ui/FilterBar';
import QuestGrid, { type Quest } from '../components/ui/QuestGrid';
import { useReadContract, useConfig } from 'wagmi';
import { readContract } from 'wagmi/actions';
import FactoryAbi from '../config/abi/RiddleQuestFactory.json';
import { RIDDLE_FACTORY_ADDRESS } from './RiddleDetail';
import { placeHolderExcerpts, placeHolderTitles, questTitles, questExcerpts } from '../utils/constant';

export default function QuestsPage() {
  // Read metadata for a the quest factory
  const { 
    data: metadata,
  } = useReadContract({
    address: RIDDLE_FACTORY_ADDRESS as `0x${string}`,
    abi: FactoryAbi.abi,
    functionName: 'getMetadata',
    // prevent eager call
    //query: { enabled: false }
  });
  const config = useConfig();

  const [typeFilter, setTypeFilter] = useState<'all' | 'riddle' | 'vote'>(
    'all'
  );
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'open' | 'closed' | 'completed' | 'solved'
  >('all');

  const [visibleQuests, setVisibleQuests] = useState<Quest[]>([]);
  
  // New state for quest submission form
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestDescription, setNewQuestDescription] = useState('');
  const [newQuestRiddle, setNewQuestRiddle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!metadata) return;
    const ALL_QUESTS: Quest[] = [];
    async function fetchQuestMetadata() {
      const data = metadata as unknown as [string, number, number];
      // Loop through quest IDs from 1 to the total count
      for (let i = Number(data[2]); i <= Number(data[1]); i++) {
        const questMetadata = await readContract(config, {
          address: RIDDLE_FACTORY_ADDRESS as `0x${string}`,
          abi: FactoryAbi.abi,
          functionName: 'getQuestMetadata',
          args: [i],
        }) as unknown as [string, number, string, boolean];
         
        ALL_QUESTS.push({
          id: i,
          type: 'riddle',
          status: questMetadata[3] ? 'solved' : 'open',
          title: placeHolderTitles[i % placeHolderTitles.length],
          excerpt: placeHolderExcerpts[i % placeHolderExcerpts.length],
        });
        const visibleQuests = ALL_QUESTS.filter((q) => {
          const typePass = typeFilter === 'all' || q.type === typeFilter;
          const statusPass =
            statusFilter === 'all' || q.status === statusFilter;
          return typePass && statusPass;
        });
        setVisibleQuests(visibleQuests);
      }
    }
    fetchQuestMetadata();
  }, [metadata, config, typeFilter, statusFilter]);

  // Handle quest submission
  const handleSubmitQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestTitle.trim() || !newQuestDescription.trim() || !newQuestRiddle.trim()) return;
    
    try {
      setIsSubmitting(true);
      // Implement the actual submission logic here
      // This is a placeholder - you'll need to implement the actual contract interaction
      console.log("Would submit quest with title:", newQuestTitle, 
                  "description:", newQuestDescription,
                  "and riddle:", newQuestRiddle);
      
      // Reset form
      setNewQuestTitle('');
      setNewQuestDescription('');
      setNewQuestRiddle('');
      setShowSubmitForm(false);
      
      // Optionally refresh quests list here
      
    } catch (error) {
      console.error('Error submitting quest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-6 pb-6 pt-16">
      <FilterBar
        selectedType={typeFilter}
        onTypeChange={setTypeFilter}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <QuestGrid quests={visibleQuests} />
      
      <div className="mt-10">
        {!showSubmitForm ? (
          <button
            type="button"
            onClick={() => setShowSubmitForm(true)}
            className="mx-auto block px-6 py-3 bg-[#AD14DB] text-white rounded-md hover:bg-[#8E10B4] transition-colors"
          >
            Submit New Quest
          </button>
        ) : (
          <div className="max-w-md mx-auto bg-[#1A103D] p-6 rounded-lg border border-[#AD14DB]/30">
            <h3 className="text-xl font-medium text-white mb-4">Submit a New Quest</h3>
            <form onSubmit={handleSubmitQuest}>
              <div className="mb-4">
                <label htmlFor="quest-title" className="block text-sm font-medium text-white/80 mb-1">
                  Quest Title
                </label>
                <input
                  id="quest-title"
                  type="text"
                  value={newQuestTitle}
                  onChange={(e) => setNewQuestTitle(e.target.value)}
                  className="w-full bg-[#2C1F56] border border-[#AD14DB]/30 rounded-md px-4 py-2 text-white"
                  placeholder="Enter quest title"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="quest-description" className="block text-sm font-medium text-white/80 mb-1">
                  Quest Description
                </label>
                <textarea
                  id="quest-description"
                  value={newQuestDescription}
                  onChange={(e) => setNewQuestDescription(e.target.value)}
                  className="w-full bg-[#2C1F56] border border-[#AD14DB]/30 rounded-md px-4 py-2 text-white min-h-[80px]"
                  placeholder="Enter quest description or context"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="quest-riddle" className="block text-sm font-medium text-white/80 mb-1">
                  Riddle
                </label>
                <textarea
                  id="quest-riddle"
                  value={newQuestRiddle}
                  onChange={(e) => setNewQuestRiddle(e.target.value)}
                  className="w-full bg-[#2C1F56] border border-[#AD14DB]/30 rounded-md px-4 py-2 text-white min-h-[120px]"
                  placeholder="Enter the actual riddle text"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#AD14DB] text-white rounded-md hover:bg-[#8E10B4] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quest'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="px-4 py-2 bg-transparent border border-white/20 text-white rounded-md hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
