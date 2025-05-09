import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isConnected) {
      toast.success('Connected!');
    }
    if (error) {
      toast.error(error.message);
    }
  }, [isConnected, error]);

  if (isConnected) {
    return (
      <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-sm">
        <span className="truncate">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="rounded-full bg-accent-riddle px-3 py-1 text-xs font-medium hover:bg-accent-riddle/80">
          Disconnect
        </button>
      </div>
    );
  }

  const injected = connectors[0];
  return (
    <button
      onClick={() => connect({ connector: injected })}
      className="rounded-full bg-accent-riddle px-6 py-2 text-sm font-medium
                 hover:bg-accent-riddle/80 disabled:opacity-40"
      disabled={isPending}>
      {isPending && injected.id === 'injected' ? 'Connecting…' : `Connect`}
    </button>
  );
}
