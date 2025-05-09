// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RiddleQuestFactory = buildModule("RiddleQuestFactory", (m) => {

  const riddleVerifier = m.contract("HonkVerifier");

  const riddleQuestFactory = m.contract("RiddleQuestFactory", 
    [riddleVerifier],
  );

  return { riddleVerifier, riddleQuestFactory };
});

export default RiddleQuestFactory;