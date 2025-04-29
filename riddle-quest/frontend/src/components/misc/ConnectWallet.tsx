import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

export const ConnectWallet: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setError('MetaMask is not installed');
        return;
      }

      const accounts = (await ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];
      setAccount(accounts[0] ?? null);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  useEffect(() => {
    const { ethereum } = window;
    if (ethereum && ethereum.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        setAccount(accounts.length ? accounts[0] : null);
      };

      ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  return (
    <div className="flex flex-col items-center space-y-2">
      {account ? (
        <span className="font-mono text-sm">Connected: {account}</span>
      ) : (
        <Button onClick={connect}>Connect Wallet</Button>
      )}

      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
