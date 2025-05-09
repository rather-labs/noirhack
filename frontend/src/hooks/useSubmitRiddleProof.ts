import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { generateProof } from '../noir/generateRiddleProof';
import { usePublicClient, useWriteContract } from 'wagmi';

import RiddleQuestFactoryAbi from '../config/abi/RiddleQuestFactory.json';
import { stringToAsciiArray } from '../utils';

interface SubmitProofParams {
  guess: string;
  questId: number;
  contractAddress: `0x${string}`;
}

export type SubmitStatus =
  | 'idle'
  | 'generating_proof'
  | 'submitting_proof'
  | 'confirming_tx'
  | 'success'
  | 'error';

export function useSubmitRiddleProof() {
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const submit = useCallback(
    async ({ guess, questId, contractAddress }: SubmitProofParams) => {
      const toastId = toast.loading('Generating proof…');

      try {
        setStatus('generating_proof');

        const parsedGuess = stringToAsciiArray(guess, 6);
        const { proof } = await generateProof({ guess: parsedGuess });

        toast.loading('Submitting proof to chain…', { id: toastId });
        setStatus('submitting_proof');

        const hash = await writeContractAsync({
          abi: RiddleQuestFactoryAbi.abi,
          address: contractAddress,
          functionName: 'submitGuess',
          args: [proof, questId],
        });

        toast.success('Proof submitted! Waiting for confirmation…', {
          id: toastId,
        });
        toast.loading('Waiting for confirmations…', { id: toastId });
        setStatus('confirming_tx');

        await publicClient!.waitForTransactionReceipt({ hash });

        toast.success('Transaction confirmed! 🎉', {
          id: toastId,
        });
        setStatus('success');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : String(err ?? 'Unknown error');
        toast.error(message, { id: toastId });
        setError(message);
        setStatus('error');
        throw err;
      }
    },
    [publicClient, writeContractAsync]
  );

  return { submit, reset, status, error };
}
