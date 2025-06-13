import { readContract } from 'wagmi/actions';
import { useConfig, useReadContract } from 'wagmi';
import { useState, useEffect, useMemo } from 'react';
import FactoryAbi from '../config/abi/RiddleQuestFactory.json';
import type { StatusFilter, TypeFilter } from '../pages/Quests';
import type { Quest } from '../components/ui/QuestGrid';

export function useGetQuests(
  typeFilter: TypeFilter,
  statusFilter: StatusFilter
) {
  const RIDDLE_FACTORY_CONTRACT_ADDRESS = import.meta.env
    .VITE_RIDDLE_FACTORY_CONTRACT_ADDRESS;

  if (!RIDDLE_FACTORY_CONTRACT_ADDRESS) {
    throw new Error(
      '⛔ Missing environment variable: RIDDLE_FACTORY_CONTRACT_ADDRESS'
    );
  }

  const config = useConfig();
  const {
    data: metadata,
    isLoading: loadingMeta,
    error: errorMeta,
    refetch,
  } = useReadContract({
    address: RIDDLE_FACTORY_CONTRACT_ADDRESS,
    abi: FactoryAbi.abi,
    functionName: 'getMetadata',
  });

  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [errorQuests, setErrorQuests] = useState<Error | null>(null);
  const [loadingQuests, setLoadingQuests] = useState(false);

  useEffect(() => {
    const onQuestCreated = () => {
      refetch();
    };
    window.addEventListener('questCreated', onQuestCreated);
    return () => {
      window.removeEventListener('questCreated', onQuestCreated);
    };
  }, [refetch]);

  useEffect(() => {
    let cancelled = false;
    if (!metadata) return;

    /** @ts-expect-error - i know */
    const total = Number(metadata[1]);
    if (total <= 0) {
      setAllQuests([]);
      return;
    }

    setLoadingQuests(true);
    setErrorQuests(null);

    (async () => {
      try {
        // fire off all calls in parallel
        const promises = Array.from({ length: total }, (_, i) =>
          readContract(config, {
            address: RIDDLE_FACTORY_CONTRACT_ADDRESS,
            abi: FactoryAbi.abi,
            functionName: 'getQuestMetadata',
            args: [i],
          }).then((raw) => {
            const [solutionHash, bounty, riddle, title, excerpt, solved] =
              raw as unknown as [
                string,
                bigint,
                string,
                string,
                string,
                boolean
              ];

            return {
              id: i,
              solutionHash,
              type: 'riddle' as const,
              status: solved ? ('solved' as const) : ('open' as const),
              bounty,
              riddle,
              title,
              excerpt,
            };
          })
        );

        const results = await Promise.all(promises);
        if (!cancelled) setAllQuests(results);
      } catch (err) {
        if (!cancelled) setErrorQuests(err as Error);
      } finally {
        if (!cancelled) setLoadingQuests(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [metadata, RIDDLE_FACTORY_CONTRACT_ADDRESS, config]);

  // 2) apply filters
  const visibleQuests = useMemo(() => {
    return allQuests.filter((q) => {
      const typeOk = typeFilter === 'all' || q.type === typeFilter;
      const statusOk = statusFilter === 'all' || q.status === statusFilter;
      return typeOk && statusOk;
    });
  }, [allQuests, typeFilter, statusFilter]);

  return {
    quests: visibleQuests,
    isLoading: loadingMeta || loadingQuests,
    error: errorMeta ?? errorQuests,
  };
}
