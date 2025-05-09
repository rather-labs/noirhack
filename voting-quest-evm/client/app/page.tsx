"use client";

import Navbar from "./components/Navbar";
import { Toaster } from 'react-hot-toast';
import RiddleContractInteraction from "./components/RiddleQuest/ContractInteraction";
import VotingProofGeneration from "./components/JwtVotingQuest/ProofGeneration";
import { QuestType, useQuestType } from "./context/QuestTypeContext";


export default function Home() {
  const { questType } = useQuestType();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {questType === QuestType.RIDDLE && (
          <RiddleContractInteraction />
        )}
        {questType === QuestType.VOTING && (
          <VotingProofGeneration />
        )}
      </main>
    </div>
  );
}
