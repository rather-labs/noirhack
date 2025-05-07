import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
import 'hardhat-contract-sizer';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 500, // helps reduce bytecode size
      },
      viaIR: false,
    },
  },
  contractSizer: {
    alphaSort: true, // Sort contracts alphabetically
    runOnCompile: true, // Automatically measure size after compilation
    disambiguatePaths: false, // Show file paths for contracts with the same name
  },
  networks: {
    hardhat:{ 
      chainId: 31_337,
      mining: {
        auto: true,
        interval: 15_000
      }
    },
    localhost: { 
      //url: 'http://localhost:8546',
      allowUnlimitedContractSize: true,
      chainId: 31_337,
    },
  },
};

export default config;
