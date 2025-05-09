import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { type Quest } from '../components/ui/QuestGrid';
import { useSubmitRiddleProof } from '../hooks/useSubmitRiddleProof';
import RiddleQuestFactoryAbi from '../config/abi/RiddleQuestFactory.json';
import { useReadContract } from 'wagmi';

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
  const { id } = useParams();
  const quest = MOCK_RIDDLES[id ?? ''];
  const [answer, setAnswer] = useState('');
  const [activity, setActivity] = useState<string[]>([]);

  // Read metadata for a specific quest ID
  const { data: questMetadata, refetch: refetchQuestMetadata } =
    useReadContract({
      address: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`,
      abi: RiddleQuestFactoryAbi,
      functionName: 'getQuestMetadata',
      args: [1],
    });

  useEffect(() => {
    console.log(questMetadata);

    refetchQuestMetadata();
  }, [questMetadata, refetchQuestMetadata]);

  const {
    submit: submitRiddle,
    handleCreateQuest,
    // reset: resetRiddle,
    // status: riddleStatus,
    // error: riddleError,
  } = useSubmitRiddleProof();

  if (!quest) {
    return (
      <div className="p-6 text-center text-white/70">Quest not found 🤔</div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const hash = await submitRiddle({
        guess: answer,
        questId: quest.id,
        contractAddress: RIDDLE_QUESTS_ADDRESES[quest.id],
      });

      console.log(hash);

      setActivity((prev) => [`🔄 You submitted “${answer.trim()}”`, ...prev]);
      setAnswer('');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6 pb-16">
      {/* Back link */}
      <Link
        to="/quests"
        className="mb-6 inline-flex items-center gap-1 text-sm text-white/70 hover:underline">
        ← Back to quests
      </Link>

      {/* Header row */}
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
        />
        <button
          type="submit"
          className="rounded-full bg-accent-riddle px-6 py-2 text-sm font-medium hover:bg-accent-riddle/80 disabled:opacity-40"
          disabled={!answer.trim()}>
          Submit answer →
        </button>
      </form>
      <button
        onClick={handleCreateQuest}
        className="rounded-full bg-accent-riddle px-6 py-2 text-sm font-medium hover:bg-accent-riddle/80 disabled:opacity-40">
        Submit create →
      </button>

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
