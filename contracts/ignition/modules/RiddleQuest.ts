// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RiddleQuestFactory = buildModule("RiddleQuestFactory", (m) => {

  const riddleVerifier = m.contract("HonkVerifier");

  const riddleQuestFactory = m.contract("RiddleQuestFactory", 
    [riddleVerifier],
  );

  m.call(riddleQuestFactory, "createRiddle", [
    "I’m always running but never move, I have no legs yet pass you by. You can’t hold me, though you try. What am I?",
    "0x26ecf9f34dfcfc713e50762298662c2ec5dfe3f039a01c9074476b956e53ecdd", // time
  ], {id: "riddle1", value: 1_000n});
  m.call(riddleQuestFactory, "createRiddle", [
    "I’m a bulb that’s not for light, with cloves that ward off bites at night. In the kitchen, I add zest, but my smell might fail a breath test. What am I?",
    "0x258d432e564772417c74674fc0cb7048f01bccdd2c06cb6bc7c9d778b04c1ab4", //garlic
  ], {id: "riddle2", value: 1_000n});
  m.call(riddleQuestFactory, "createRiddle", [
    "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
    "0x21053b27f95ddcb9eb7a133972ab9607583517ed02cbb9883cda95c549de38bb", // echo
  ], {id: "riddle3", value: 1_000n});
  m.call(riddleQuestFactory, "createRiddle", [
    "I’m tall when I’m young, and I’m short when I’m old. What am I?",
    "0x278bb843a6daf54f20ce1e095658adfc0562ce7aacea56dc2703c3b12a6bf0fe", // candle
  ], {id: "riddle4", value: 1_000n});
  m.call(riddleQuestFactory, "createRiddle", [
    "What can travel around the world while staying in a corner?",
    "0x1685ce55c39275fff29aeaed45d51ac3e324d7c7595162b45dbe187707a955ab", // stamp
  ], {id: "riddle5", value: 1_000n});

  return { riddleVerifier, riddleQuestFactory };
});

export default RiddleQuestFactory;