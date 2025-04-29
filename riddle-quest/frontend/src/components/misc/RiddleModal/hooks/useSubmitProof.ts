import { useState, useCallback } from 'react';
import { getQuestMetadata, submitProof } from '../../../../api/riddle_quest';
import { generateProof } from '../../../../circuit/generateProof';
import { RIDDLE_CONTRACT_ADDRESS } from '../../../../config/env';

export type SubmitStatus =
  | 'idle'
  | 'fetching_metadata'
  | 'generating_proof'
  | 'submitting_proof'
  | 'success'
  | 'error';

export function useSubmitProof() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const reset = useCallback(() => {
    setError(null);
    setStatus('idle');
  }, []);

  const submit = useCallback(async (guess: number[]) => {
    setError(null);
    setStatus('fetching_metadata');

    try {
      const metadata = await getQuestMetadata(RIDDLE_CONTRACT_ADDRESS);

      setStatus('generating_proof');
      const proofData = await generateProof(guess, metadata.solutionHash);

      setStatus('submitting_proof');
      const txHash = await submitProof(RIDDLE_CONTRACT_ADDRESS, proofData, [
        metadata.solutionHash,
      ]);

      setStatus('success');
      return txHash;
    } catch (unknownErr: unknown) {
      const err =
        unknownErr instanceof Error
          ? unknownErr
          : new Error(String(unknownErr));

      setError(err.message);
      setStatus('error');
      throw err;
    }
  }, []);

  return { submit, reset, status, error };
}
