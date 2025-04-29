export {};

interface EthereumProvider {
  // Sends a JSON-RPC request
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  // Subscription for account changes
  on(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  // Remove listener
  removeListener(
    event: 'accountsChanged',
    handler: (accounts: string[]) => void
  ): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
