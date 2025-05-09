import { parseEther } from 'ethers';
import hre from 'hardhat';

async function main() {
  const walletAddres = '0x35816a929022b5A8Eea8a7B4b7d15355219E5D18';
  const [firstWalletClient] = await hre.viem.getWalletClients();
  const txHash = await firstWalletClient.sendTransaction({
    to: walletAddres,
    value: parseEther('100'),
    account: firstWalletClient.account,
  });
  console.log(txHash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
