import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { type Quest } from '../components/ui/QuestGrid';
import { useSubmitRiddleProof } from '../hooks/useSubmitRiddleProof';
import RiddleQuestFactoryAbi from '../config/abi/RiddleQuestFactory.json';
import { useWatchContractEvent } from 'wagmi';

const MOCK_RIDDLES: Record<string, Quest & { prompt: string }> = {
  '1': {
    id: 1,
    type: 'riddle',
    status: 'open',
    title: 'The Sphinx’s Cipher',
    excerpt: '',
    prompt:
      `“I speak without a mouth and hear without ears. ` +
      `I have nobody, but I come alive with the wind. What am I?”`,
  },
};

const RIDDLE_QUESTS_ADDRESES: Record<string, `0x${string}`> = {
  '1': `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`,
};

export default function RiddleDetail() {
  const { id = '' } = useParams();
  const quest = MOCK_RIDDLES[id];
  const factory = RIDDLE_QUESTS_ADDRESES[id];

  const [answer, setAnswer] = useState('');
  const [activity, setActivity] = useState<string[]>(() => {
    const key = `attempts_${id}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  });

  const { submit: submitRiddle, status: submitStatus } = useSubmitRiddleProof();

  useEffect(() => {
    localStorage.setItem(`attempts_${id}`, JSON.stringify(activity));
  }, [activity, id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;

    try {
      await submitRiddle({
        guess: answer,
        questId: quest.id,
        contractAddress: factory,
      });

      setActivity((prev) => [`🔄 You submitted “${answer.trim()}”`, ...prev]);
      setAnswer('');
    } catch {
      /** */
    }
  }

  useWatchContractEvent({
    address: factory,
    abi: RiddleQuestFactoryAbi,
    eventName: 'QuestSolved',
    onLogs: ([questId]) => {
      if (Number(questId) !== quest.id) return;
      setActivity((prev) => [
        '🎉 Proof verified! Quest marked as solved.',
        ...prev,
      ]);
    },
  });

  useWatchContractEvent({
    address: factory,
    abi: RiddleQuestFactoryAbi,
    eventName: 'BountyClaimed',
    onLogs: ([questId, winner]) => {
      if (Number(questId) !== quest.id) return;
      setActivity((prev) => [
        /** @ts-expect-error - i know */
        `🏆 Bounty claimed by ${winner.slice(0, 6)}…`,
        ...prev,
      ]);
    },
  });

  if (!quest) {
    return (
      <div className="p-6 text-center text-white/70">Quest not found 🤔</div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6 pb-16">
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
          <span className="rounded-full bg-status-open/20 px-2 py-0.5 text-status-open uppercase tracking-wide">
            {quest.status}
          </span>
        </div>
        <div className="text-xs text-white/60">
          Reward • 2 ETH · Ends • 18 May 2025
        </div>
      </div>

      {/* Prompt */}
      <pre className="whitespace-pre-wrap rounded-xl bg-white/5 p-6 text-sm leading-relaxed">
        {quest.prompt}
      </pre>

      {/* Answer form */}
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
            submitStatus === 'submitting_proof'
          }
        />

        <button
          type="submit"
          disabled={
            !answer.trim() ||
            submitStatus === 'generating_proof' ||
            submitStatus === 'submitting_proof'
          }
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent-riddle px-6 py-2 text-sm font-medium hover:bg-accent-riddle/80 disabled:opacity-40">
          {/* Spinner during work */}
          {(submitStatus === 'generating_proof' ||
            submitStatus === 'submitting_proof') && (
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
              />
            </svg>
          )}

          {submitStatus === 'generating_proof'
            ? 'Generating proof…'
            : submitStatus === 'submitting_proof'
            ? 'Submitting…'
            : 'Submit answer →'}
        </button>
      </form>

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
