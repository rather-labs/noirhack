// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VotingQuestFactory = buildModule("VotingQuestFactory", (m) => {

  const jwtVerifier = m.contract("JwtVerifier");

  const proofVerifier = m.contract("ProofVerifier");

  const votingQuestFactory = m.contract("VotingQuestFactory", 
    [jwtVerifier],
  );

  return { jwtVerifier, proofVerifier, votingQuestFactory };
});

export default VotingQuestFactory;