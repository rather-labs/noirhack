import { createConfig, http } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { metaMask } from '@wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [metaMask()],
});
