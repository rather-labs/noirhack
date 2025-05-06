import { jwtVotingQuestContractArtifact } from './src/artifacts/jwtVotingQuest.js';
import { Contract, createPXEClient, waitForPXE } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';

const { PXE_URL = 'http://localhost:8080' } = process.env;

async function main() {
  console.log(`Connecting to PXE: ${PXE_URL}...`);
  const pxe = createPXEClient(PXE_URL);
  await waitForPXE(pxe);

  console.log('Getting test account...');
  const [ownerWallet] = await getInitialTestAccountsWallets(pxe);
  const ownerAddress = ownerWallet.getAddress();

  console.log('Deploying contract...');
  const contract = await Contract.deploy(ownerWallet, jwtVotingQuestContractArtifact, [ownerAddress, 1])
    .send()
    .deployed();

  console.log(`Contract deployed at ${contract.address.toString()}`);
}

main().catch(err => {
  console.error('Error in deployment:', err);
  process.exit(1);
}); 