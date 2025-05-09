'use client';
import { Noir } from '@noir-lang/noir_js';
import type { CompiledCircuit, InputMap } from '@noir-lang/types';
import { UltraHonkBackend, Barretenberg, RawBuffer } from '@aztec/bb.js';
import toast from "react-hot-toast";

import circuitVerifyJSON from '@/public/circuit/binVerifyproof.json' assert { type: 'json' };

export type ProofDataForRecursion = {
  /** @description Public inputs of a proof */
  publicInputs: string[];
  /** @description An byte array representing the proof */
  proof: string[];
};

export async function generateRecursiveProof(circuit: CompiledCircuit, inputs: InputMap, keccak = true): Promise<ProofDataForRecursion> {
  try {
  	console.log("circuit", circuit)

    toast.loading("Generating noir circuit... ⏳", {duration: 1_000_000, id: "toast-message"});
    const noir = new Noir(circuit);
    toast.remove("toast-message");

    toast.loading("Generating witness... ⏳", {duration: 1_000_000, id: "toast-message"});
    const { witness } = await noir.execute(inputs);
    toast.remove("toast-message");
  
    toast.loading("Initializing backend... ⏳", {duration: 1_000_000, id: "toast-message"});
    const backend = new UltraHonkBackend(circuit.bytecode, { threads: 4 }, { recursive: true });
    toast.remove("toast-message");
    
    toast.loading("Generating inner proof... ⏳", {duration: 1_000_000, id: "toast-message"});
    const proof = await backend.generateProofForRecursiveAggregation(witness, { keccak });
    console.log("proof", proof)
    toast.remove("toast-message");
      
    return proof as unknown as ProofDataForRecursion;
  } catch (error: unknown) {
    toast.remove("toast-message");
    toast.error("Failed to generate proof! 🚫", {duration: 10_000, id: "proof-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof: ${errorMessage}`);
  }
}  


export async function generateProofArtifacts(innerCircuit: CompiledCircuit, proofToVerify: ProofDataForRecursion): Promise<InputMap> {
  try {
    // taken from https://github.com/saleel/noir-recursion-example/tree/edfa6944673e2023f6db258996cf96a5d9d6a72a
    toast.loading("Initializing backend... ⏳", {duration: 1_000_000, id: "toast-message"});
    const backend = new UltraHonkBackend(innerCircuit.bytecode, { threads: 4 }, { recursive: true });
    toast.remove("toast-message");
    
    // Get verification key for inner circuit as fields
    const innerCircuitVerificationKey = await backend.getVerificationKey();
    const barretenbergAPI = await Barretenberg.new({ threads: 4 });
    const vkAsFields = (await barretenbergAPI.acirVkAsFieldsUltraHonk(new RawBuffer(innerCircuitVerificationKey))).map(field => field.toString());

    return {
      verification_key: vkAsFields,
      proof: proofToVerify.proof,
      public_inputs: proofToVerify.publicInputs, // key_hash not necesary for ultrahonk
    } as InputMap;
  } catch (error: unknown) {
    toast.remove("toast-message");
    toast.error("Failed to generate proof artifacts! 🚫", {duration: 10_000, id: "proof-artifacts-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof artifacts: ${errorMessage}`);
  }
}

export async function verifyInnerProof(innerCircuit: CompiledCircuit, proofToVerify: ProofDataForRecursion): Promise<string> {
  try {

    const inputs = await generateProofArtifacts(innerCircuit, proofToVerify);

    console.log("proof Artifacts", inputs)

    console.log("recursivePoofInputs", inputs)

    toast.loading("Getting circuit... ⏳", {duration: 1_000_000, id: "toast-message"});
    const circuit = circuitVerifyJSON as CompiledCircuit;
    toast.remove("toast-message");

  	console.log("circuit", circuit)

    toast.loading("Generating noir circuit... ⏳", {duration: 1_000_000, id: "toast-message"});
    const noir = new Noir(circuit);
    toast.remove("toast-message");

    toast.loading("Generating witness... ⏳", {duration: 1_000_000, id: "toast-message"});
    const { witness } = await noir.execute(inputs);
    toast.remove("toast-message");

    toast.loading("Initializing backend... ⏳", {duration: 1_000_000, id: "toast-message"});
    const backend = new UltraHonkBackend(circuit.bytecode, { threads: 4 }, { recursive: true });
    toast.remove("toast-message");
    
    toast.loading("Generating proof... ⏳", {duration: 1_000_000, id: "toast-message"});
    const proof = await backend.generateProof(witness);
    toast.remove("toast-message");
    
    toast.loading("Verifying proof... ⏳", {duration: 1_000_000, id: "toast-message"});
    const isValid = await backend.verifyProof(proof);
    toast.remove("toast-message");

    console.log("isValid", isValid)
  
    if (isValid) {
      toast.success("Proof verified successfully! 🎉", {duration: 100_000, id: "proof-verified"});
    } else {
      toast.error("Proof verification failed! 🚫", {duration: 100_000, id: "proof-verification-failed"});
    }
    
    return JSON.stringify(proof, null, 2);
  } catch (error: unknown) {
    toast.remove("toast-message");
    toast.error("Failed to generate proof! 🚫", {duration: 10_000, id: "proof-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof: ${errorMessage}`);
  }
}  