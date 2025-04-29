import { useState, useCallback } from 'react';
import { get_quest_metadata, submit_proof } from '../../../../api/riddle_quest';
import { generate_proof } from '../../../../circuit/generate_proof';
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
      const metadata = await get_quest_metadata(RIDDLE_CONTRACT_ADDRESS);

      setStatus('generating_proof');
      const proof_data = await generate_proof(guess, metadata.solutionHash);

      setStatus('submitting_proof');
      const txHash = await submit_proof(RIDDLE_CONTRACT_ADDRESS, proof_data, [
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
