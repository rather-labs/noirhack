import { Noir } from '@noir-lang/noir_js';
import type { InputMap, ProofData } from '@noir-lang/types';
import { UltraHonkBackend } from '@aztec/bb.js';
import RiddleCircuitJSON from '../noir/circuits/riddle.json';

export async function generateProof(
  inputs: InputMap,
  keccak = true
): Promise<ProofData> {
  try {
    console.log('inputs', inputs);

    const noir = new Noir(RiddleCircuitJSON);

    const { witness } = await noir.execute(inputs);
    console.log('witness', witness);

    const backend = new UltraHonkBackend(RiddleCircuitJSON.bytecode, {
      threads: 4,
    });

    const proof = await backend.generateProof(witness, { keccak });
    console.log('proof', proof);

    const verified = await backend.verifyProof(proof, { keccak });
    console.log('verified', verified);

    return {
      proof: proof.proof,
      publicInputs: proof.publicInputs,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof: ${errorMessage}`);
  }
}
