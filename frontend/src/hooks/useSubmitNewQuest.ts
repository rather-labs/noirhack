import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { generateProof } from '../noir/generateRiddleProof';
import { usePublicClient, useWriteContract } from 'wagmi';

import RiddleQuestFactoryAbi from '../config/abi/RiddleQuestFactory.json';
import { stringToAsciiArray } from '../utils';
import { parseEther } from 'viem';

interface SubmitProofParams {
  title: string;
  excerpt: string;
  riddle: string;
  answer: string;
  bounty: number;
}

export type SubmitStatus =
  | 'idle'
  | 'generating_proof'
  | 'submitting_proof'
  | 'confirming_tx'
  | 'success'
  | 'error';

export function useSubmitNewQuest() {
  const RIDDLE_FACTORY_CONTRACT_ADDRESS = import.meta.env
    .VITE_RIDDLE_FACTORY_CONTRACT_ADDRESS;

  if (!RIDDLE_FACTORY_CONTRACT_ADDRESS) {
    throw new Error(
      '⛔ Missing environment variable: RIDDLE_FACTORY_CONTRACT_ADDRESS'
    );
  }

  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const submit = useCallback(
    async ({ title, excerpt, riddle, answer, bounty }: SubmitProofParams) => {
      const toastId = toast.loading('Submitting new quest to chain…');

      try {
        setStatus('generating_proof');

        const parsedAnswer = stringToAsciiArray(answer, 6);
        const { publicInputs } = await generateProof({ guess: parsedAnswer });

        setStatus('submitting_proof');

        const hash = await writeContractAsync({
          abi: RiddleQuestFactoryAbi.abi,
          address: RIDDLE_FACTORY_CONTRACT_ADDRESS,
          functionName: 'createRiddle',
          args: [riddle, title, excerpt, publicInputs[0]],
          value: parseEther(bounty.toString()),
        });

        toast.loading('New quest submitted! Waiting for confirmations…', {
          id: toastId,
        });
        setStatus('confirming_tx');

        const confirm = await publicClient?.waitForTransactionReceipt({ hash });

        if (confirm?.status === 'reverted') {
          throw new Error('Something went wrong ups');
        }

        toast.success('New quest created! 🎉', {
          id: toastId,
        });
        setStatus('success');
        window.dispatchEvent(new Event('questCreated'));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : String(err ?? 'Unknown error');
        toast.error(message, { id: toastId });
        setError(message);
        setStatus('error');
      }
    },
    [publicClient, writeContractAsync, RIDDLE_FACTORY_CONTRACT_ADDRESS]
  );

  return { submit, reset, status, error };
}
