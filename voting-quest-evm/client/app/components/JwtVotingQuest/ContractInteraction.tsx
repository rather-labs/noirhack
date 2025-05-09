'use client'

import { useState } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'
import toast from 'react-hot-toast'
import type { ProofData } from '@noir-lang/types'
//import { Hex, hexToBytes, hexToString, padHex, stringToHex, toHex } from 'viem';

// ABI for the VotingQuestFactory contract
import votingQuestFactory from '@/public/contracts/VotingQuestFactory.json' assert { type: 'json' };
import verifier from '@/public/contracts/JwtVerifier.json' assert { type: 'json' };
import { keccak256 } from 'viem'

const votingQuestFactoryABI = votingQuestFactory.abi

interface ContractInteractionProps {
  proof: ProofData | null;
}

export default function VotingContractInteraction({ proof }: ContractInteractionProps) {
  const [questObjective, setQuestObjective] = useState<string>('1')
  const [questIdToSolve, setQuestIdToSolve] = useState<string>('0')
  const [bounty, setBounty] = useState<string>('0')
  const [questIdToQuery, setQuestIdToQuery] = useState<string>('0')
  const [secretToSubmit, setSecretToSubmit] = useState<string>('0x')
  const [candidateToVoteFor, setCandidateToVoteFor] = useState<string>('0')
  const [questIdToClaim, setQuestIdToClaim] = useState<string>('0')
  const [secretToClaim, setSecretToClaim] = useState<string>('0x')

  const contractAddress = process.env.NEXT_PUBLIC_VOTING_QUEST_FACTORY_ADDRESS 
  
  // Write function
  const { writeContractAsync, error: writeError, isPending } = useWriteContract()

  // Read metadata for a the quest factory
  const { data: metadata, 
          isLoading: isLoadingMetadata, 
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
      console.log("contractAddress", contractAddress as `0x${string}`)
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
      const hashedSecretToSubmit = keccak256(secretToSubmit as `0x${string}`)
      const candidateToVoteForBigInt = BigInt(candidateToVoteFor || '0')

      const proofBytes = `0x${Array.from(Object.values(proof.proof))
        .map(n => n.toString(16).padStart(2, '0'))
        .join('')}`;

      await writeContractAsync({ 
        abi: votingQuestFactoryABI,
        address: contractAddress as `0x${string}`,
        functionName: 'submitVote',
        args: [
          //toHex(proof.proof), 
          proofBytes  as string,
          //`0x${Buffer.from(proof.proof).toString('hex')}`,
          //proof.publicInputs as `0x${string}`[],
          //proof.publicInputs.map((input) => padHex(input as `0x${string}`, { size: 32 })),
          proof.publicInputs.map((input) => input as string),
          questIdToSolve, 
          candidateToVoteForBigInt, 
          hashedSecretToSubmit 
        ],
     })
    } catch (error) {
      toast.error('Failed to submit vote. Please check your inputs and ensure you have a valid proof.')
      console.error(error)
    }
  }

  const handleVerifyProof = async () => {
    if (!proof) {
      toast.error('No proof available. Please generate a proof first.')
      return
    }

    try {
      const proofBytes = `0x${Array.from(proof.proof)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')}`;

      const publicInputsHex = proof.publicInputs.map(input => {
          if (typeof input === 'string' && input.startsWith('0x')) {
              return input;
          }              
          return `0x${Buffer.from(input).toString('hex')}`;
      });
      const result = await writeContractAsync({ 
        abi: verifier.abi,
        address: process.env.NEXT_PUBLIC_JWT_VERIFIER_ADDRESS as `0x${string}`,
        functionName: 'verify',
        args: [
          proofBytes as `0x${string}`, 
          //proofBytes  as `0x${string}`,
          //`0x${Buffer.from(proof.proof).toString('hex')}`,
          publicInputsHex as `0x${string}`[],
          //proof.publicInputs.map((input) => padHex(input as `0x${string}`, { size: 32 })),
          //proof.publicInputs.map((input) => input as `0x${string}`)
        ]
     })
      console.log("result", result)
    } catch (error) {
      toast.error('Failed to submit vote. Please check your inputs and ensure you have a valid proof.')
      console.error(error)
    }
  }

  const handleClaimBounty = async () => {
    try {
      await writeContractAsync({
        abi: votingQuestFactoryABI,
        address: contractAddress as `0x${string}`,
        functionName: 'claimBounty',
        args: [questIdToClaim, secretToClaim],
     })
    } catch (error) {
      toast.error('Failed to claim bounty. Please check your inputs.')
      console.error(error)
    }
  }

  // Format metadata response for display
  const formaQuestMetadata = () => {
    if (!questMetadata) return 'No metadata available'
    
    // Extract values from the tuple
    const [winnerSecret, questBounty, questObjective, isSolved] = questMetadata as [string, bigint, bigint, boolean]


    if (!questObjective) return 'No quest found with this ID'
    
    
    return (
      <div>
        <p><strong>Bounty:</strong> {questBounty.toString()}</p>
        <p><strong>Quest Objective:</strong> {questObjective.toString()}</p>
        {isSolved ? <p><strong>Quest Solved</strong></p> : <p><strong>Quest still open</strong></p>}
        {isSolved && <p><strong>Winner Secret:</strong> {winnerSecret}</p>}
      </div>
    )
  }

  const formaMetadata = () => {
    if (!metadata) return 'No metadata available'
    
    // Extract values from the tuple
    console.log("metadata", metadata)
    const [verifier, questId, lowerOpenQuestId] = metadata as [string, number, number]
    
    return (
      <div>
        <p><strong>Verifier:</strong> {verifier}</p>
        <p><strong>Current Quest ID:</strong> {questId}</p>
        <p><strong>Lower Open Quest ID:</strong> {lowerOpenQuestId}</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Voting Quest Contract Interaction</h2>
      <div className="flex flex-wrap gap-6">
        <div className="flex-1 min-w-[300px]">
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

        <div className="flex-1 min-w-[300px]">
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
              <label htmlFor="secretToSubmit" className="block text-sm font-medium text-gray-700 mb-1">
                Secret to submit for the quest (hex):
              </label>
              <input
                type="text"
                id="secretToSubmit"
                value={secretToSubmit}
                onChange={(e) => setSecretToSubmit(e.target.value.startsWith('0x') ? e.target.value : `0x${e.target.value.replace(/[^0-9a-fA-F]/g, '')}`)}
                placeholder="0x..."
                pattern="^0x[0-9a-fA-F]*$"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
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
                Please generate a proof first before submitting a vote or tryting to verify on chain.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-medium mb-2">Claim bounty</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="bounty" className="block text-sm font-medium text-gray-700 mb-1">
                Quest ID to claim bounty:
              </label>
              <input
                type="number"
                id="questIdToClaim"
                value={questIdToClaim}
                onChange={(e) => setQuestIdToClaim(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="secretToClaim" className="block text-sm font-medium text-gray-700 mb-1">
                Secret to claim bounty:
              </label>
              <input
                type="text"
                id="secretToClaim"
                value={secretToClaim}
                onChange={(e) => setSecretToClaim(e.target.value.startsWith('0x') ? e.target.value : `0x${e.target.value.replace(/[^0-9a-fA-F]/g, '')}`)}
                placeholder="0x..."
                pattern="^0x[0-9a-fA-F]*$"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <button
              type="button"
              onClick={handleClaimBounty}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? 'Waiting transaction...' : 'Claim Bounty'}
            </button>
          </div>
        </div>


        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-medium mb-2">Verify proof on chain</h3>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleVerifyProof}
              disabled={!proof || isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? 'Waiting transaction...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-medium mb-2">Get Quest Factory Metadata</h3>
          <div className="space-y-3">
            <div>
            {formaMetadata()}
            </div>
            <button
              type="button"
              onClick={ async () => {await refetchMetadata()}}
              disabled={isLoadingMetadata}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoadingMetadata ? 'Loading...' : 'Get Metadata'}
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-[300px]">
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
              onClick={ async () => {await refetchQuestMetadata()}}
              disabled={isLoadingQuestMetadata}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoadingQuestMetadata ? 'Loading...' : 'Get Quest Metadata'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 