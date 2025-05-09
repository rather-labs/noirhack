import { useConnect, useAccount } from 'wagmi';

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();

  if (isConnected) return <p>Connected: {address}</p>;
  return (
    <>
      {connectors.map((c) => (
        <button key={c.id} onClick={() => connect({ connector: c })}>
          {isPending && c.id === 'injected'
            ? 'Connecting…'
            : `Connect with ${c.name}`}
        </button>
      ))}
      {error && <p>{error.message}</p>}
    </>
  );
}
