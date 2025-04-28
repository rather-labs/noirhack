'use client';
import { Noir } from '@noir-lang/noir_js';
import { createFileManager, compile } from '@noir-lang/noir_wasm';
import type { CompiledCircuit, InputMap } from '@noir-lang/types';
import circuitJSON from '@/public/circuit/jwtnoir/target/jwtnoir.json'
import toast from "react-hot-toast";

export type Circuit = {
  main: string;
  nargoToml: string;
}

// Preload the backend dynamically to avoid top-level await issues
let backendModulePromise: Promise<typeof import('@aztec/bb.js')> | null = null;
const getBackendModule = (): Promise<typeof import('@aztec/bb.js')> => {
  if (!backendModulePromise) {
    backendModulePromise = import('@aztec/bb.js').catch(err => {
      console.error("Error preloading backend module:", err);
      backendModulePromise = null;
      throw err;
    });
  }
  return backendModulePromise;
};

// Start preloading immediately
getBackendModule();

// Helper function to safely fetch text content
async function fetchText(url: string): Promise<{ text: string; ok: boolean; status: number }> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { text: "", ok: false, status: response.status };
    }
    const text = await response.text();
    return { text, ok: true, status: response.status };
  } catch (error) {
    toast.error(`Error fetching ${url}: ${error}`, {duration: 10_000, id: "fetch-error"});
    return { text: "", ok: false, status: 500 };
  }
}

export async function getCircuit(circuitInfo?: Circuit) {
  try {
    // Set default values if arguments are not provided
    const main = circuitInfo?.main || "/circuit/jwtnoir/src/main.nr";
    const nargoToml = circuitInfo?.nargoToml || "/circuit/jwtnoir/Nargo.toml";
    
    toast.loading('Fetching circuit from: ⏳', {duration: 1_000_000, id: "fetch-circuit"});
    
    const fm = createFileManager("/");

    // Load files using our safe helper function
    const mainBody = await fetchText(main);
    const nargoTomlBody = await fetchText(nargoToml);

    if (!mainBody.ok || !nargoTomlBody.ok) {
      throw new Error("Failed to fetch circuit files");
    }
    await fm.writeFile("./src/main.nr", new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(mainBody.text));
        controller.close();
      }
    }));
    await fm.writeFile("./Nargo.toml", new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(nargoTomlBody.text));
        controller.close();
      }
    }));
    
    toast.remove("fetch-circuit");

    // Compile the circuit
    toast.loading('Compiling circuit... ⏳', {duration: 1_000_000, id: "compile-circuit"});
    const circuit = await compile(fm);
    toast.remove("compile-circuit");
    return circuit;
  } catch (error) {
    toast.error(`Error getting circuit: ${error}`, {duration: 10_000, id: "get-circuit-error"});
    throw error;
  }
}

export async function generateProof(inputs: InputMap): Promise<string> {
  try {
    toast.loading("Getting circuit... ⏳", {duration: 1_000_000, id: "get-circuit"});
    // Fails due to fetch on window not being defined
    //const circuit = (await getCircuit()).program as CompiledCircuit;
	  const circuit = circuitJSON as CompiledCircuit;
    toast.remove("get-circuit");

  	console.log("circuit", circuit)

    toast.loading("Generating noir circuit... ⏳", {duration: 1_000_000, id: "generate-noir-circuit"});
    const noir = new Noir(circuit);
    toast.remove("generate-noir-circuit");

    toast.loading("Generating witness... ⏳", {duration: 1_000_000, id: "generate-witness"});
    const { witness } = await noir.execute(inputs);
    toast.remove("generate-witness");

    toast.loading("Loading backend... ⏳", {duration: 1_000_000, id: "load-backend"});
    const backendModule = await getBackendModule();
    const { UltraHonkBackend } = backendModule;
    toast.remove("load-backend");
    
    toast.loading("Initializing backend... ⏳", {duration: 1_000_000, id: "initialize-backend"});
    const backend = new UltraHonkBackend(circuit.bytecode);
    toast.remove("initialize-backend");
    
    toast.loading("Generating proof... ⏳", {duration: 1_000_000, id: "generate-proof"});
    const proof = await backend.generateProof(witness);
    toast.remove("generate-proof");
    
    toast.loading("Verifying proof... ⏳", {duration: 1_000_000, id: "verify-proof"});
    const isValid = await backend.verifyProof(proof);
    toast.remove("verify-proof");
    if (isValid) {
      toast.success("Proof verified successfully! 🎉", {duration: 10_000, id: "proof-verified"});
    } else {
      toast.error("Proof verification failed! 🚫", {duration: 10_000, id: "proof-verification-failed"});
    }
    
    return JSON.stringify(proof, null, 2);
  } catch (error: unknown) {
    toast.error("Failed to generate proof! 🚫", {duration: 10_000, id: "proof-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof: ${errorMessage}`);
  }
}  