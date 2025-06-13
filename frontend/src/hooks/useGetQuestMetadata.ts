import { useReadContract } from 'wagmi';
import FactoryAbi from '../config/abi/RiddleQuestFactory.json';
import { formatEther } from 'viem/utils';
import { useEffect, useMemo } from 'react';

export interface QuestMetadata {
  bounty: string;
  riddle: string;
  solved: boolean;
}

export function useGetQuestMetadata(id: number | bigint) {
  const RIDDLE_FACTORY_CONTRACT_ADDRESS = import.meta.env
    .VITE_RIDDLE_FACTORY_CONTRACT_ADDRESS;

  if (!RIDDLE_FACTORY_CONTRACT_ADDRESS) {
    throw new Error(
      '⛔ Missing environment variable: RIDDLE_FACTORY_CONTRACT_ADDRESS'
    );
  }

  const { data, isLoading, isError, refetch } = useReadContract({
    address: RIDDLE_FACTORY_CONTRACT_ADDRESS,
    abi: FactoryAbi.abi,
    functionName: 'getQuestMetadata',
    args: [id],
  });

  useEffect(() => {
    const onQuestUpdated = () => {
      refetch();
    };
    window.addEventListener('questUpdated', onQuestUpdated);
    return () => {
      window.removeEventListener('questUpdated', onQuestUpdated);
    };
  }, [refetch]);

  const parsed = useMemo<QuestMetadata | null>(() => {
    if (!data) return null;

    const [, bounty, riddle, , , solved] = data as unknown as [
      string,
      bigint,
      string,
      string,
      string,
      boolean
    ];

    return {
      bounty: formatEther(bounty),
      riddle,
      solved,
    };
  }, [data]);

  return {
    metadata: parsed,
    isError,
    isLoading,
  };
}
