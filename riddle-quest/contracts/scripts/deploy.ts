// scripts/deploy‑hub.ts
import hre from 'hardhat';
import { padHex } from 'viem';

async function main() {
  const { ethers } = hre;

  const verifier = await ethers.deployContract('HonkVerifier');
  await verifier.waitForDeployment();
  console.log(`Verifier deployed   → ${verifier.target}`);

  const hub = await ethers.deployContract('RiddleQuestHub', [verifier.target]);
  await hub.waitForDeployment();
  console.log(`RiddleQuestHub deployed → ${hub.target}`);

  const solutionHash = padHex(
    '0x26a9cd878299aae15aa2e27d41fab958fbe7f0730d81e834c5315bdbf3eecb04',
    { size: 32 }
  );

  const title = 'The Sphinx’s Cipher';
  const prompt =
    'I speak without a mouth and hear without ears. I have nobody, but I come alive with the wind. What am I?';
  const deadline = Math.floor(Date.now() / 1_000) + 7 * 24 * 60 * 60; // +7 days
  const bounty = ethers.parseEther('0.05');

  const tx = await hub.createRiddle(title, prompt, solutionHash, deadline, {
    value: bounty,
  });
  const receipt = await tx.wait();

  const questCreated = receipt?.logs?.find(
    (log: any) => log.fragment?.name === 'QuestCreated'
  );
  const questId =
    questCreated && 'args' in questCreated
      ? questCreated.args.questId
      : '(unknown)';

  console.log(`Quest #${questId.toString()} created with 0.05 ETH bounty`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
