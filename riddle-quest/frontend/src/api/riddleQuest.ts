import { type Abi, type Address } from 'viem';
import { readContract, writeContract } from './web3';
import QuestArtifact from '../config/abi/Quest.json';

const QuestAbi = QuestArtifact as unknown as Abi;

export interface QuestMetadata {
  verifier: Address;
  solutionHash: `0x${string}`;
  winner: Address;
  bounty: bigint;
  solved: boolean;
}

/**
 * Fetches quest state from chain
 * @param address Quest contract address
 */
export async function getQuestMetadata(
  address: Address
): Promise<QuestMetadata> {
  const [verifier, solutionHash, winner, bounty, solved] = await readContract<
    [Address, `0x${string}`, Address, bigint, boolean]
  >({
    address,
    abi: QuestAbi,
    functionName: 'getMetadata',
  });
  return { verifier, solutionHash, winner, bounty, solved };
}

/**
 * Submits a proof to the quest contract
 * @param address Quest contract address
 * @param proof   Hex string of proof bytes
 * @param publicInputs Array of hex-encoded public inputs
 * @returns Transaction hash
 */
export async function submitProof(
  address: Address,
  proof: `0x${string}`,
  publicInputs: `0x${string}`[]
): Promise<`0x${string}`> {
  return await writeContract({
    address,
    abi: QuestAbi,
    functionName: 'submitProof',
    args: [proof, publicInputs],
  });
}
