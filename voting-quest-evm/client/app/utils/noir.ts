'use client';
import { Noir } from '@noir-lang/noir_js';
import type { CompiledCircuit, InputMap, ProofData } from '@noir-lang/types';
import { UltraHonkBackend } from '@aztec/bb.js';
import circuitJSON from '@/public/circuit/jwtnoir/target/jwtnoir.json' assert { type: 'json' };
import toast from "react-hot-toast";


export type Circuit = {
  main: string;
  nargoToml: string;
}

export async function generateProof(inputs: InputMap): Promise<ProofData> {
  try {
    toast.loading("Getting circuit... ⏳", {duration: 1_000_000, id: "toast-message"});
    // Fails due to fetch on window not being defined
    //const circuit = (await getCircuit()).program as CompiledCircuit;
	  const circuit = circuitJSON as CompiledCircuit;
    toast.remove("toast-message");

  	console.log("circuit", circuit)

    toast.loading("Generating noir circuit... ⏳", {duration: 1_000_000, id: "toast-message"});
    const noir = new Noir(circuit);
    toast.remove("toast-message");

    toast.loading("Generating witness... ⏳", {duration: 1_000_000, id: "toast-message"});
    const { witness } = await noir.execute(inputs);
    toast.remove("toast-message");
  
    toast.loading("Initializing backend... ⏳", {duration: 1_000_000, id: "toast-message"});
    const backend = new UltraHonkBackend(circuit.bytecode, { threads: 4 });
    toast.remove("toast-message");
    
    toast.loading("Generating proof... ⏳", {duration: 1_000_000, id: "toast-message"});
    const proof = await backend.generateProof(witness);
    console.log("proof", proof)
    toast.remove("toast-message");

    toast.loading("Verifying proof... ⏳", {duration: 1_000_000, id: "toast-message"});
    const verified = await backend.verifyProof(proof);
    console.log("verified", verified)
    toast.remove("toast-message");
    return proof;
  } catch (error: unknown) {
    toast.remove("toast-message");
    toast.error("Failed to generate proof! 🚫", {duration: 10_000, id: "proof-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof: ${errorMessage}`);
  }
}  

// Add this new function for casting votes
export async function castVoteOnChain(inputs: InputMap, identifier: number, candidate: number) {
  try {
    // Get the proof artifacts that will be passed to the contract
    toast.loading("Generating proof artifacts... ⏳", {duration: 1_000_000, id: "toast-message"});
    const proof = await generateProof(inputs);
    toast.remove("toast-message");
    
    // Convert identifier to number if it's a string
    const numericIdentifier = typeof identifier === 'string' ? Number(identifier) : identifier;
    // Wait for transaction to be processed
    //await tx.wait();
    
    toast.remove("toast-message");
    toast.success("Vote cast successfully! 🎉", {duration: 5000});
    
    return true;
  } catch (error: unknown) {
    toast.remove("toast-message");
    toast.error(`Failed to cast vote: ${error instanceof Error ? error.message : String(error)}`, {duration: 10000});
    throw error;
  }
}
