'use client';
import { Noir } from '@noir-lang/noir_js';
import type { CompiledCircuit, InputMap, ProofData } from '@noir-lang/types';
import { UltraHonkBackend, splitHonkProof } from '@aztec/bb.js';
import toast from "react-hot-toast";
import { toHex } from 'viem';

export async function generateProof(circuit: CompiledCircuit, inputs: InputMap, keccak = true ): Promise<ProofData> {
  try {
    toast.loading("Generating noir circuit... ⏳", {duration: 1_000_000, id: "toast-message"});
    const noir = new Noir(circuit);
    toast.remove("toast-message");

    toast.loading("Generating witness... ⏳", {duration: 1_000_000, id: "toast-message"});
    const { witness } = await noir.execute(inputs);
    toast.remove("toast-message");
    console.log("witness", witness)
  
    toast.loading("Initializing backend... ⏳", {duration: 1_000_000, id: "toast-message"});
    const backend = new UltraHonkBackend(circuit.bytecode, { threads: 4 });
    toast.remove("toast-message");
    
    toast.loading("Generating proof... ⏳", {duration: 1_000_000, id: "toast-message"});
    const proof = await backend.generateProof(witness, { keccak });
    console.log("proof", proof)
    toast.remove("toast-message");

    toast.loading("Verifying proof... ⏳", {duration: 1_000_000, id: "toast-message"});
    const verified = await backend.verifyProof(proof, { keccak });
    console.log("verified", verified)
    toast.remove("toast-message");
    if (verified) {
      toast.success("Proof verified! 🎉", {duration: 15_000, id: "toast-message"});
    } else {
      toast.error("Proof verification failed! 🚫", {duration: 15_000, id: "toast-message"});
    }

    return {
      proof: proof.proof,
      publicInputs: proof.publicInputs
    }
  } catch (error: unknown) {
    toast.remove("toast-message");
    toast.error("Failed to generate proof! 🚫", {duration: 10_000, id: "proof-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof: ${errorMessage}`);
  }
}  

// FUNCTIONS FOR CLI GENERATED PROOF
export async function getProofFromFile(NPublicInputs: number): Promise<ProofData> {
  try {
    const response = await fetch('@/public/circuit/proof')
    const arrayBuffer = await response.arrayBuffer();
    const proofFromFile = new Uint8Array(arrayBuffer);

    const splitProof = splitHonkProof(proofFromFile, NPublicInputs);
    // Chunk public inputs into bytes32 array
    const publicInputsAsBytes32: `0x${string}`[] = [];
    for (let i = 0; i < NPublicInputs; i++) {
      const input = splitProof.publicInputs.slice(i * 32, (i + 1) * 32);
      // Convert BigInt to hex string, pad to 64 characters (32 bytes) and add 0x prefix
      const hexValue = toHex(input);
      publicInputsAsBytes32.push(hexValue as `0x${string}`);
    }
    console.log("splitProof", splitProof.proof, publicInputsAsBytes32)
    return {
      proof: toHex(splitProof.proof),
      publicInputs: publicInputsAsBytes32
    }
  } catch (error: unknown) {
    toast.remove("toast-message");
    toast.error("Failed to generate proof! 🚫", {duration: 10_000, id: "proof-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof: ${errorMessage}`);
  }
}  

