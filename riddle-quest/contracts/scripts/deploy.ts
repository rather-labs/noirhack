import hre from 'hardhat';
import { padHex, size } from 'viem';

async function main() {
  const { ethers } = hre;

  // 1. Deploy Verifier
  const HonkVerifier = await ethers.getContractFactory('HonkVerifier');
  const verifier = await HonkVerifier.deploy();
  await verifier.waitForDeployment();
  console.log(`Verifier deployed to: ${await verifier.getAddress()}`);

  const solutionHash = padHex(
    '0x26a9cd878299aae15aa2e27d41fab958fbe7f0730d81e834c5315bdbf3eecb04',
    { size: 32 }
  );

  // 3. Deploy Quest contract
  const bounty = ethers.parseEther('0.05'); // 0.05 ETH reward
  const Quest = await ethers.getContractFactory('Quest');
  const quest = await Quest.deploy(await verifier.getAddress(), solutionHash, {
    value: bounty,
  });
  await quest.waitForDeployment();
  console.log(`Quest deployed to: ${await quest.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
