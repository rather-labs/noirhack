import { useState, useCallback } from 'react';
import { generateProof } from '../noir/generateRiddleProof';
import { useWriteContract } from 'wagmi';

import RiddleQuestFactoryAbi from '../config/abi/RiddleQuestFactory.json';
import { stringToAsciiArray } from '../utils';
import { parseEther } from 'viem';

interface SubmitProofParams {
  guess: string;
  questId: number;
  contractAddress: `0x${string}`;
}

export type SubmitStatus =
  | 'idle'
  | 'fetching_metadata'
  | 'generating_proof'
  | 'submitting_proof'
  | 'success'
  | 'error';

export function useSubmitRiddleProof() {
  const { writeContractAsync } = useWriteContract();

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const reset = useCallback(() => {
    setError(null);
    setStatus('idle');
  }, []);

  const submit = useCallback(
    async ({ guess, questId, contractAddress }: SubmitProofParams) => {
      try {
        setStatus('generating_proof');
        const parsedGuess = stringToAsciiArray(guess, 6);
        const { proof, publicInputs } = await generateProof({
          guess: parsedGuess,
        });

        console.log(publicInputs);

        setStatus('submitting_proof');
        const proofBytes = `0x${Array.from(Object.values(proof))
          .map((n) => n.toString(16).padStart(2, '0'))
          .join('')}`;
        await writeContractAsync({
          abi: RiddleQuestFactoryAbi,
          address: contractAddress as `0x${string}`,
          functionName: 'submitGuess',
          args: [proofBytes as string, questId],
        });

        console.log('sucess');
      } catch (e) {
        console.log(e);
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err.message);
        setStatus('error');
        throw err;
      }
    },
    [writeContractAsync]
  );

  const handleCreateQuest = async () =>
    // riddle: string,
    // bounty: bigint,
    // solution: string,
    // contractAddress: `0x${string}`
    {
      try {
        const parsedSolution = stringToAsciiArray('tiempo', 6);
        const proof = await generateProof({
          guess: parsedSolution,
        });

        await writeContractAsync({
          abi: RiddleQuestFactoryAbi,
          address: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`,
          functionName: 'createRiddle',
          args: ['testing', proof.publicInputs[0]],
          value: parseEther('0.05'),
        });

        console.log('sucess');
      } catch (error) {
        console.error(error);
      }
    };

  return { submit, handleCreateQuest, reset, status, error };
}
