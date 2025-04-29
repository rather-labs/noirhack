import type { Abi, Address } from 'viem';
import { read_contract, write_contract } from './web3';
import QuestAbiJson from '../config/abi/Quest.json';
import { ProofData } from '@aztec/bb.js';
const QuestAbi = QuestAbiJson as unknown as Abi;

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
export async function get_quest_metadata(
  address: Address
): Promise<QuestMetadata> {
  const [verifier, solutionHash, winner, bounty, solved] = await read_contract<
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
export async function submit_proof(
  address: Address,
  proof_data: ProofData,
  publicInputs: `0x${string}`[]
): Promise<`0x${string}`> {
  return await write_contract({
    address,
    abi: QuestAbi,
    functionName: 'submitProof',
    args: [proof_data.proof, publicInputs],
  });
}
