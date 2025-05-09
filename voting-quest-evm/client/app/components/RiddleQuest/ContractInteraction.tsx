'use client'

import { useEffect, useState } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'
import toast from 'react-hot-toast'
import type { CompiledCircuit, InputMap } from '@noir-lang/types'
//import { Hex, hexToBytes, hexToString, padHex, stringToHex, toHex } from 'viem';

// ABI for the VotingQuestFactory contract
import riddleQuestFactory from '@/public/contracts/RiddleQuestFactory.json' assert { type: 'json' };
import verifier from '@/public/contracts/RiddleVerifier.json' assert { type: 'json' };
import RiddleCircuitJSON from '@/public/circuit/riddle.json' assert { type: 'json' };

import { generateProof } from '@/app/utils/noir'


const riddleQuestFactoryABI = riddleQuestFactory.abi


/**
 * Converts a string to an array of Field elements representing ASCII values
 * @param str The string to convert
 * @param length The fixed length of the output array (will pad with zeros if needed)
 * @returns An array of numbers representing the ASCII values of the string
 */
function stringToAsciiArray(str: string, length: number): number[] {
  // Convert string to ASCII values
  const asciiValues = Array.from(str).map(char => char.charCodeAt(0));
  // Pad with zeros if needed or truncate if too long
  if (asciiValues.length < length) {
    return [...asciiValues, ...Array(length - asciiValues.length).fill(0)];
  } 
  if (asciiValues.length > length) {
    return asciiValues.slice(0, length);
  }
  return asciiValues;
}


export default function RiddleContractInteraction() {

  const [questIdToSolve, setQuestIdToSolve] = useState<string>('0')
  const [bounty, setBounty] = useState<string>('0')
  const [riddle, setRiddle] = useState<string>('')
  const [guess, setGuess] = useState<string>('')
  const [answerToRiddle, setAnswerToRiddle] = useState<string>('')

  const contractAddress = process.env.NEXT_PUBLIC_RIDDLE_QUEST_FACTORY_ADDRESS 
  
  // Write function
  const { writeContractAsync, error: writeError, isPending } = useWriteContract()

  // Read metadata for a the quest factory
  const { data: metadata, 
          isLoading: isLoadingMetadata, 
          refetch: refetchMetadata 
        } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: riddleQuestFactoryABI,
    functionName: 'getMetadata',
    // prevent eager call
    query: { enabled: false } 
  })
  // Read metadata for a specific quest ID
  const { data: questMetadata, 
          refetch: refetchQuestMetadata 
        } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: riddleQuestFactoryABI,
    functionName: 'getQuestMetadata',
    args: [questIdToSolve],
  })

  useEffect(() => {
    refetchQuestMetadata()
  }, [refetchQuestMetadata])

  const handleCreateQuest = async () => {
    try {
      const answerAsciiArray = stringToAsciiArray(answerToRiddle, 6)
      const proof = await generateProof(
        RiddleCircuitJSON as CompiledCircuit, 
        { guess: answerAsciiArray }
      )

      await writeContractAsync({ 
        abi: riddleQuestFactoryABI,
        address: contractAddress as `0x${string}`,
        functionName: 'createRiddle',
        args: [riddle, proof.publicInputs[0]],
        value: BigInt(bounty)
     })
    } catch (error) {
      toast.error(writeError?.message || 'Failed to create quest. Please check your inputs.')
      console.error(error)
    }
  }

  const handleSolveQuest = async () => {
    try {
      const guessAsciiArray = stringToAsciiArray(guess, 6)
      console.log("guessAsciiArray", guessAsciiArray)
      const proof = await generateProof(
        RiddleCircuitJSON as CompiledCircuit, 
        { guess: guessAsciiArray } as InputMap
      )
      const proofBytes = `0x${Array.from(Object.values(proof.proof))
        .map(n => n.toString(16).padStart(2, '0'))
        .join('')}`;
      await writeContractAsync({ 
        abi: riddleQuestFactoryABI,
        address: contractAddress as `0x${string}`,
        functionName: 'submitGuess',
        args: [
          //toHex(proof.proof), 
          proofBytes  as string,
          //`0x${Buffer.from(proof.proof).toString('hex')}`,
          //proof.publicInputs as `0x${string}`[],
          //proof.publicInputs.map((input) => padHex(input as `0x${string}`, { size: 32 })),
          proof.publicInputs.map((input) => input as string),
          questIdToSolve, 
        ],
     })
    } catch (error) {
      toast.error('Failed to submit vote. Please check your inputs and ensure you have a valid proof.')
      console.error(error)
    }
  }

  const handleVerifyProof = async () => {
    try {
      const guessAsciiArray = stringToAsciiArray(guess, 6)
      console.log("guessAsciiArray", guessAsciiArray)
      const proof = await generateProof(
        RiddleCircuitJSON as CompiledCircuit, 
        { guess: guessAsciiArray } as InputMap
      )
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
        address: process.env.NEXT_PUBLIC_RIDDLE_VERIFIER_ADDRESS as `0x${string}`,
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

  // Format metadata response for display
  const formaQuestMetadata = () => {
    if (!questMetadata) return 'No metadata available'
    
    // Extract values from the tuple
    const [solutionHash, questBounty, riddle, isSolved] = questMetadata as [string, bigint, string, boolean]


    if (!riddle) return (
      <div>
        <p><strong>Bounty:</strong> No data available</p>
        <p><strong>Riddle:</strong> No data available</p>
        <p><strong>Quest Solved:</strong> No data available</p>
      </div>
    )
      
    console.log("solutionHash", solutionHash)
    return (
      <div>
        <p><strong>Bounty:</strong> {questBounty.toString()}</p>
        <p><strong>Riddle:</strong> {riddle.toString()}</p>
        {isSolved ? <p><strong>Quest Solved</strong></p> : <p><strong>Quest still open</strong></p>}
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
        { questId >= lowerOpenQuestId ? 
        <div>
          <p><strong>Current Quest ID:</strong> {questId}</p> 
          <p><strong>Lower Open Quest ID:</strong> {lowerOpenQuestId}</p>
        </div>:
        <div>
          <p><strong>No Currently open quest</strong></p> 
        </div>
        }

      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
       <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Riddle Quest
        </h1>
        <p className="text-gray-600 mb-4">
          Solve the riddle to complete this quest
        </p>
      </div>
            
      <h2 className="text-xl font-semibold mb-4">Voting Quest Contract Interaction</h2>
      <div className="flex flex-wrap gap-6">

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
              {formaQuestMetadata()}
              </div>
            <div>
              <label htmlFor="secretToSubmit" className="block text-sm font-medium text-gray-700 mb-1">
                Answer to the riddle:
              </label>
              <input
                type="text"
                id="guess"
                value={guess}
                onChange={(e) => {
                  // Limit input to 6 characters
                  if (e.target.value.length <= 6) {
                    setGuess(e.target.value);
                  }
                }}
                maxLength={6}
                placeholder="Up to 6 letter word"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <button
              type="button"
              onClick={handleSolveQuest}
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? 'Waiting transaction...' : 'Solve Quest'}
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-medium mb-2">Verify proof on chain</h3>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleVerifyProof}
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? 'Waiting transaction...' : 'Verify'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
      <div className="flex-1 min-w-[300px]">
          <h3 className="text-lg font-medium mb-2">Create New Quest</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="questObjective" className="block text-sm font-medium text-gray-700 mb-1">
                Riddle:
              </label>
              <input
                type="text"
                id="riddle"
                value={riddle}
                onChange={(e) => setRiddle(e.target.value)}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:w-1/3 sm:text-sm border-gray-300 rounded-md"
                min="1"
              />
            </div>
            <div>
              <label htmlFor="questObjective" className="block text-sm font-medium text-gray-700 mb-1">
                Answer to the riddle:
              </label>
              <input
                type="text"
                id="answerToRiddle"
                value={answerToRiddle}
                onChange={(e) => setAnswerToRiddle(e.target.value)}
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

      </div>
    </div>
  )
} 