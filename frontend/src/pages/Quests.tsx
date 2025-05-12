import { useEffect, useState } from 'react';
import FilterBar from '../components/ui/FilterBar';
import QuestGrid, { type Quest } from '../components/ui/QuestGrid';
import { useReadContract, useConfig } from 'wagmi';
import { readContract } from 'wagmi/actions';
import FactoryAbi from '../config/abi/RiddleQuestFactory.json';
import { RIDDLE_FACTORY_ADDRESS } from './RiddleDetail';
import { placeHolderExcerpts, placeHolderTitles } from '../utils/constant';

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

  return (
    <div className="px-6 pb-6 pt-16">
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
