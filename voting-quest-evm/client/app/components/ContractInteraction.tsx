'use client'

import { useState } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'
import toast from 'react-hot-toast'
import type { ProofData } from '@noir-lang/types'

// ABI for the VotingQuestFactory contract
import votingQuestFactory from '@/public/contracts/VotingQuestFactory.json' assert { type: 'json' };

const votingQuestFactoryABI = votingQuestFactory.abi

interface ContractInteractionProps {
  proof: ProofData | null;
}

export default function ContractInteraction({ proof }: ContractInteractionProps) {
  const [questObjective, setQuestObjective] = useState<string>('1')
  const [questIdToSolve, setQuestIdToSolve] = useState<string>('0')
  const [bounty, setBounty] = useState<string>('0')
  const [questIdToQuery, setQuestIdToQuery] = useState<string>('0')
  const [secretToSubmit, setSecretToSubmit] = useState<string>('')
  const [candidateToVoteFor, setCandidateToVoteFor] = useState<string>('0')

  const contractAddress = process.env.NEXT_PUBLIC_VOTING_QUEST_FACTORY_ADDRESS 
  
  // Write function
  const { writeContractAsync, error: writeError, isPending } = useWriteContract()

  // Read metadata for a the quest factory
  const { data: metadata, 
          isLoading: isLoadingMetadata, 
          isSuccess: isSuccessMetadata, 
          error: metadataError,
          refetch: refetchMetadata 
        } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: votingQuestFactoryABI,
    functionName: 'getMetadata',
    // prevent eager call
    query: { enabled: false } 
  })
  // Read metadata for a specific quest ID
  const { data: questMetadata, 
          isLoading: isLoadingQuestMetadata, 
          isSuccess: isSuccessQuestMetadata, 
          error: questMetadataError,
          refetch: refetchQuestMetadata 
        } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: votingQuestFactoryABI,
    functionName: 'getQuestMetadata',
    args: [questIdToQuery],
    // prevent eager call
    query: { enabled: false } 
  })

  const handleCreateQuest = async () => {
    try {
      const bountyBigInt = BigInt(bounty || '0')
      const objectiveBigInt = BigInt(questObjective || '1')
      await writeContractAsync({ 
        abi: votingQuestFactoryABI,
        address: contractAddress as `0x${string}`,
        functionName: 'createQuest',
        args: [bountyBigInt, objectiveBigInt],
     })
    } catch (error) {
      toast.error(writeError?.message || 'Failed to create quest. Please check your inputs.')
      console.error(error)
    }
  }

  const handleSolveQuest = async () => {
    if (!proof) {
      toast.error('No proof available. Please generate a proof first.')
      return
    }

    try {
      const objectiveBigInt = BigInt(questObjective || '1')
      const candidateBigInt = BigInt(candidateToVoteFor || '0')
      
      await writeContractAsync({ 
        abi: votingQuestFactoryABI,
        address: contractAddress as `0x${string}`,
        functionName: 'submitVote',
        args: [proof, candidateBigInt, objectiveBigInt],
     })
    } catch (error) {
      toast.error('Failed to submit vote. Please check your inputs and ensure you have a valid proof.')
      console.error(error)
    }
  }
  
  const handleGetMetadata = async () => {
    console.log('refetching metadata')
    console.log("questMetadata",questMetadata)
    console.log("contractAddress",contractAddress)
    await refetchMetadata()
    console.log("isSuccessMetadata",isSuccessMetadata)
    console.log("metadataError",metadataError)
    console.log("questMetadata post refetch",questMetadata)
  }

  const handleGetQuestMetadata = async () => {
    console.log('refetching quest metadata')
    console.log("questMetadata",questMetadata)
    console.log("contractAddress",contractAddress)
    await refetchQuestMetadata()
    console.log("questMetadataError",questMetadataError)
    console.log("isSuccessQuestMetadata",isSuccessQuestMetadata)
    console.log("questMetadata post refetch",questMetadata)
  }

  // Format metadata response for display
  const formaQuestMetadata = () => {
    if (!questMetadata) return 'No metadata available'
    
    // Extract values from the tuple
    const [winnerSecret, questBounty, questObjective, isSolved] = questMetadata as [string, bigint, bigint, boolean]
    
    return (
      <div>
        <p><strong>Winner Secret:</strong> {winnerSecret}</p>
        <p><strong>Bounty:</strong> {questBounty.toString()}</p>
        <p><strong>Quest Objective:</strong> {questObjective.toString()}</p>
        <p><strong>Solved:</strong> {isSolved ? 'Yes' : 'No'}</p>
      </div>
    )
  }

  const formaMetadata = () => {
    if (!metadata) return 'No metadata available'
    
    // Extract values from the tuple
    const [verifier, questId, lowerOpenQuestId] = metadata as [string, string, bigint, boolean]
    
    return (
      <div>
        <p><strong>Verifier:</strong> {verifier}</p>
        <p><strong>Current Quest ID:</strong> {questId.toString()}</p>
        <p><strong>Lower Open Quest ID:</strong> {lowerOpenQuestId.toString()}</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Voting Quest Contract Interaction</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Create New Quest</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="questObjective" className="block text-sm font-medium text-gray-700 mb-1">
              Quest Objective:
            </label>
            <input
              type="number"
              id="questObjective"
              value={questObjective}
              onChange={(e) => setQuestObjective(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
              min="1"
            />
          </div>
          <div>
            <label htmlFor="bounty" className="block text-sm font-medium text-gray-700 mb-1">
              Bounty (in wei):
            </label>
            <input
              type="number"
              id="bounty"
              value={bounty}
              onChange={(e) => setBounty(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
              min="0"
            />
          </div>
          <button
            type="button"
            onClick={handleCreateQuest}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? 'Waiting transaction...' : 'Create Quest'}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Solve Quest</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="bounty" className="block text-sm font-medium text-gray-700 mb-1">
              Quest ID to Solve:
            </label>
            <input
              type="number"
              id="questIdToSolve"
              value={questIdToSolve}
              onChange={(e) => setQuestIdToSolve(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="bounty" className="block text-sm font-medium text-gray-700 mb-1">
              Secret to submit for the quest:
            </label>
            <input
              type="text"
              id="secretToSubmit"
              value={secretToSubmit}
              onChange={(e) => setSecretToSubmit(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="bounty" className="block text-sm font-medium text-gray-700 mb-1">
              Candidate to vote for:
            </label>
            <input
              type="number"
              id="candidateToVoteFor"
              value={candidateToVoteFor}
              onChange={(e) => setCandidateToVoteFor(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
              min="0"
            />
          </div>
          <button
            type="button"
            onClick={handleSolveQuest}
            disabled={!proof || isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? 'Waiting transaction...' : 'Solve Quest'}
          </button>
          {!proof && (
            <p className="text-sm text-red-600 mt-2">
              Please generate a proof first before submitting a vote.
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Get Quest Factory Metadata</h3>
        <div className="space-y-3">
          <div>
          {formaMetadata()}
          </div>
          <button
            type="button"
            onClick={handleGetMetadata}
            disabled={isLoadingMetadata}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoadingMetadata ? 'Loading...' : 'Get Metadata'}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Get Quest Metadata</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="questIdToQuery" className="block text-sm font-medium text-gray-700 mb-1">
              Quest ID:
            </label>
            <input
              type="number"
              id="questIdToQuery"
              value={questIdToQuery}
              onChange={(e) => setQuestIdToQuery(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
              min="0"
            />
          </div>

          <div>
          {formaQuestMetadata()}
          </div>
          <button
            type="button"
            onClick={handleGetQuestMetadata}
            disabled={isLoadingQuestMetadata}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoadingQuestMetadata ? 'Loading...' : 'Get Quest Metadata'}
          </button>
        </div>
      </div>
    </div>
  )
} 