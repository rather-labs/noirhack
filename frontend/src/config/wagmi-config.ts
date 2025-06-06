import { injected } from 'wagmi/connectors';
import { sepolia, hardhat } from 'wagmi/chains';
import { http, createConfig } from 'wagmi';

const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL as string;

if (!SEPOLIA_RPC_URL) {
  throw new Error('⛔ Missing environment variable: SEPOLIA_RPC_URL');
}

export const wagmiConfig = createConfig({
  chains: [hardhat, sepolia],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC_URL),
    [hardhat.id]: http('http://127.0.0.1:8545', {
      timeout: 10_000,
      retryCount: 10,
    }),
  },
  syncConnectedChain: true,
});
