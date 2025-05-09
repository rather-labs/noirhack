// scripts/deploy‑factory.ts
import hre from 'hardhat';
import { padHex } from 'viem';

async function main() {
  const { ethers } = hre;

  const verifier = await ethers.deployContract('HonkVerifier');
  await verifier.waitForDeployment();
  console.log(`Verifier deployed          → ${verifier.target}`);

  const factory = await ethers.deployContract('RiddleQuestFactory', [
    verifier.target,
  ]);
  await factory.waitForDeployment();
  console.log(`RiddleQuestFactory deployed → ${factory.target}`);

  // const solutionHash = padHex(
  //   '0x26a9cd878299aae15aa2e27d41fab958fbe7f0730d81e834c5315bdbf3eecb04',
  //   { size: 32 }
  // );

  // const riddle =
  //   'I speak without a mouth and hear without ears. I have nobody, but I come alive with the wind. What am I?';

  // const bounty = ethers.parseEther('0.05');

  // const tx = await factory.createRiddle(riddle, solutionHash, {
  //   value: bounty,
  // });
  // const receipt = await tx.wait();

  // const questCreated = receipt?.logs?.find(
  //   (log: any) => log.fragment?.name === 'QuestCreated'
  // );
  // const questId =
  //   questCreated && 'args' in questCreated ? questCreated.args.questId : '(?)';

  // console.log(`Quest #${questId.toString()} created with 0.05 ETH bounty`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
