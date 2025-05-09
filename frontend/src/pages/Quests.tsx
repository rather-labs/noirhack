import { useEffect, useState } from 'react';
import FilterBar from '../components/ui/FilterBar';
import QuestGrid, { type Quest } from '../components/ui/QuestGrid';
import { useReadContract, useConfig  } from 'wagmi';
import { readContract } from 'wagmi/actions';
import FactoryAbi from '../config/abi/RiddleQuestFactory.json';
import { RIDDLE_FACTORY_ADDRESS } from './RiddleDetail';

const placeHolderTitles = [
  "The Sphinx's Cipher",
  "Ethereum's Enigma",
  "Blockchain Brainteaser",
  "Cryptic Conundrum",
  "The Web3 Labyrinth",
  "Digital Riddle Vault",
  "The Solidity Secret",
  "Quantum Quandary",
  "The Miner's Mystery",
  "Decentralized Dilemma",
]
const placeHolderExcerpts = [
  "Crack the code, claim your crypto reward!",
  "Solve this puzzle and walk away with the bounty.",
  "Your wit is the key to unlocking this treasure.",
  "Test your blockchain knowledge and earn rewards.",
  "Decipher the clues, collect the crypto prize.",
  "Sharpen your mind and fill your wallet.",
  "Puzzles with payouts - are you clever enough?",
  "Riddles worth solving - literally.",
  "Your next crypto payday is just one solution away.",
  "Brain power converts directly to token rewards here.",
]

export default function QuestsPage() {
  // Read metadata for a the quest factory
  const { 
    data: metadata
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
    // Loop through quest IDs from 1 to the total count
      for (let i = Number(metadata[2]); i <= Number(metadata[1]); i++) {
        const questMetadata = await readContract(config, {
          address: RIDDLE_FACTORY_ADDRESS as `0x${string}`,
          abi: FactoryAbi.abi,
          functionName: 'getQuestMetadata',
          args: [i],
        });
        ALL_QUESTS.push({
          id: i,
          type: 'riddle',
          status: questMetadata[3] ? 'solved' : 'open',
          title: placeHolderTitles[i % placeHolderTitles.length],
          excerpt: placeHolderExcerpts[i % placeHolderExcerpts.length],
        });  
        const visibleQuests = ALL_QUESTS.filter((q) => {
          const typePass = typeFilter === 'all' || q.type === typeFilter;
          const statusPass = statusFilter === 'all' || q.status === statusFilter;
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
