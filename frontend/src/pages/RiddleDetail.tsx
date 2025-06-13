import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Spinner } from '../components/ui/Spinner';
import { useSubmitRiddleProof } from '../hooks/useSubmitRiddleProof';
import { useGetQuestMetadata } from '../hooks/useGetQuestMetadata';

function getOrCreateDeadline(id: string): string {
  const key = `deadline_${id}`;
  const stored = localStorage.getItem(key);
  if (stored) return stored;
  const randomMs = Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000);
  const dateIso = new Date(Date.now() + randomMs).toISOString();
  localStorage.setItem(key, dateIso);
  return dateIso;
}

export default function RiddleDetail() {
  const params = useParams();
  const questId = Number(params.id);
  const RIDDLE_FACTORY_CONTRACT_ADDRESS = import.meta.env
    .VITE_RIDDLE_FACTORY_CONTRACT_ADDRESS;

  const [answer, setAnswer] = useState('');
  const [activity, setActivity] = useState<string[]>(() => {
    const stored = localStorage.getItem(`questId_${questId}`);
    return stored ? JSON.parse(stored) : [];
  });

  const { metadata, isLoading } = useGetQuestMetadata(questId);
  const { submitRiddle, submitStatus } = useSubmitRiddleProof(setActivity);

  const questMetadata = useMemo(() => {
    if (!metadata || isLoading) {
      return undefined;
    }

    const { bounty, riddle, solved } = metadata;
    const deadline = new Date(
      getOrCreateDeadline(questId.toString())
    ).toLocaleDateString();

    return {
      bounty,
      riddle,
      solved,
      status: solved ? 'solved' : 'open',
      deadline,
    };
  }, [metadata, questId, isLoading]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!answer.trim()) return;

      setActivity((prev) => [`🔄 You submitted “${answer.trim()}”`, ...prev]);

      await submitRiddle({
        guess: answer,
        questId,
        contractAddress: RIDDLE_FACTORY_CONTRACT_ADDRESS,
      });

      setAnswer('');
    },
    [submitRiddle, answer, questId, RIDDLE_FACTORY_CONTRACT_ADDRESS]
  );

  // useWatchContractEvent({
  //   address: RIDDLE_FACTORY_CONTRACT_ADDRESS,
  //   abi: RiddleQuestFactoryAbi.abi,
  //   eventName: 'SubmitFailure',
  //   args: [BigInt(questId), null],
  //   enabled: !questMetadata?.solved,
  //   onLogs(logs) {
  //     for (const log of logs) {
  //       /** @ts-expect-error - i know */
  //       const [, solver] = log.args as [bigint, `0x${string}`];
  //       setActivity((prev) => [
  //         `❌ ${solver.slice(0, 6)}… made an attempt`,
  //         ...prev,
  //       ]);
  //     }
  //   },
  //   onError(error) {
  //     console.error('Error listening for SubmitFailure:', error);
  //   },
  //   pollingInterval: 15_000,
  // });

  // useWatchContractEvent({
  //   address: RIDDLE_FACTORY_CONTRACT_ADDRESS,
  //   abi: RiddleQuestFactoryAbi.abi,
  //   eventName: 'QuestSolved',
  //   args: [BigInt(questId)],
  //   enabled: !questMetadata?.solved,
  //   onLogs() {
  //     toast.success('🎉 Proof verified! Quest marked as solved.');
  //     setActivity((prev) => [
  //       '🎉 Proof verified! Quest marked as solved.',
  //       ...prev,
  //     ]);
  //   },
  //   pollingInterval: 10_000,
  // });

  useEffect(() => {
    localStorage.setItem(`questId_${questId}`, JSON.stringify(activity));
  }, [activity, questId]);

  if (!RIDDLE_FACTORY_CONTRACT_ADDRESS) {
    return (
      <div className="absolute inset-0 border flex justify-center items-center text-white/70">
        Quest not found 🤔
      </div>
    );
  }

  if (isLoading || !questMetadata) {
    return <Spinner />;
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {/* Back link */}
      <Link
        to="/quests"
        className="mb-6 inline-flex items-center gap-1 text-sm text-white/70 hover:underline">
        ← Back to quests
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-riddle/20 px-2 py-0.5 text-accent-riddle">
            🎲 Puzzle
          </span>

          <span
            className={`rounded-full px-2 py-0.5 uppercase tracking-wide ${
              questMetadata.solved
                ? 'bg-status-completed/20 text-status-completed'
                : 'bg-status-open/20 text-status-open'
            }`}>
            {questMetadata.status}
          </span>
        </div>

        <div className="text-xs text-white/60">
          Reward • {questMetadata.bounty} ETH · Ends • {questMetadata.deadline}
        </div>
      </div>

      {/* Prompt */}
      <pre className="whitespace-pre-wrap rounded-xl bg-white/5 p-6 text-sm leading-relaxed">
        {questMetadata.riddle}
      </pre>

      {/* Answer form */}
      {!questMetadata.solved && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4 sm:flex-row">
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            type="text"
            placeholder="Your answer..."
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm placeholder-white/40 focus:border-accent-riddle focus:outline-none"
            disabled={
              submitStatus === 'generating_proof' ||
              submitStatus === 'submitting_proof' ||
              submitStatus === 'confirming_tx' ||
              questMetadata.solved
            }
          />

          <button
            type="submit"
            disabled={
              !answer.trim() ||
              submitStatus === 'generating_proof' ||
              submitStatus === 'submitting_proof' ||
              submitStatus === 'confirming_tx' ||
              questMetadata.solved
            }
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-riddle px-6 py-2 text-sm font-medium hover:bg-accent-riddle/80 disabled:opacity-40">
            {submitStatus === 'generating_proof'
              ? 'Generating proof…'
              : submitStatus === 'submitting_proof'
              ? 'Submitting…'
              : submitStatus === 'confirming_tx'
              ? 'Confirming…'
              : 'Submit answer →'}
          </button>
        </form>
      )}

      {/* Activity feed */}
      <section className="mt-12">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">
          Activity
        </h2>

        {activity.length === 0 ? (
          <p className="text-sm text-white/50">No activity yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {activity.map((item, i) => (
              <li
                key={i}
                className="rounded-lg bg-white/5 px-4 py-2 text-white/70">
                {item}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
