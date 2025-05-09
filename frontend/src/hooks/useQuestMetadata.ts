import { useReadContract } from 'wagmi';
import FactoryAbi from '../config/abi/RiddleQuestFactory.json';
import { formatEther } from 'viem/utils';
import { useMemo } from 'react';

export interface QuestMetadata {
  bounty: string;
  prompt: string;
  solved: boolean;
}

export function useQuestMetadata(factory: `0x${string}`, id: number | bigint) {
  const { data, isLoading, isError } = useReadContract({
    address: factory,
    abi: FactoryAbi.abi,
    functionName: 'getQuestMetadata',
    args: [id],
  });

  const parsed = useMemo<QuestMetadata | null>(() => {
    if (!data) return null;
    const [, bountyBn, riddle, solved] = data as [
      string,
      bigint,
      string,
      boolean
    ];
    return {
      bounty: formatEther(bountyBn),
      prompt: riddle,
      solved,
    };
  }, [data]);

  return { data: parsed, isLoading, isError };
}
