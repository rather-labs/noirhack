'use client';
import { Noir, type CompiledCircuit, type InputMap, type ProofData  } from '@noir-lang/noir_js';
import { UltraHonkBackend, Barretenberg, RawBuffer } from '@aztec/bb.js';
// Commented out unused imports
// import { Contract } from '@aztec/aztec.js';
// import { Wallet } from '@aztec/accounts';
import circuitJSON from '@/public/circuit/jwtnoir/target/jwtnoir.json' assert { type: 'json' };
import circuitVerifyJSON from '@/public/circuit/binVerifyproof/target/binVerifyproof.json' assert { type: 'json' };
import toast from "react-hot-toast";

export type Circuit = {
  main: string;
  nargoToml: string;
}

export async function generateProof(inputs: InputMap): Promise<ProofData> {
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
  
    toast.loading("Initializing backend... ⏳", {duration: 1_000_000, id: "initialize-backend"});
    const backend = new UltraHonkBackend(circuit.bytecode, { threads: 4 }, { recursive: true });
    toast.remove("initialize-backend");
    
    toast.loading("Generating inner proof... ⏳", {duration: 1_000_000, id: "generate-proof"});
    const proof = await backend.generateProofForRecursiveAggregation(witness);
    console.log("proof", proof)
    toast.remove("generate-proof");
      
    return proof;
  } catch (error: unknown) {
    toast.error("Failed to generate proof! 🚫", {duration: 10_000, id: "proof-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof: ${errorMessage}`);
  }
}  


export async function generateProofArtifacts(proofToVerify: ProofData, circuit?: CompiledCircuit): Promise<InputMap> {
  try {
    // taken from https://github.com/saleel/noir-recursion-example/tree/edfa6944673e2023f6db258996cf96a5d9d6a72a
    if (!circuit) {
      toast.loading("Getting circuit... ⏳", {duration: 1_000_000, id: "get-circuit"});
      // Fails due to fetch on window not being defined
      //const circuit = (await getCircuit()).program as CompiledCircuit;
	    circuit = circuitJSON as CompiledCircuit;
      toast.remove("get-circuit");
    }
    
    toast.loading("Initializing backend... ⏳", {duration: 1_000_000, id: "initialize-backend"});
    const backend = new UltraHonkBackend(circuit.bytecode, { threads: 4 }, { recursive: true });
    toast.remove("initialize-backend");
    
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
    toast.error("Failed to generate proof artifacts! 🚫", {duration: 10_000, id: "proof-artifacts-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof artifacts: ${errorMessage}`);
  }
}

export async function verifyProof(proofToVerify: ProofData): Promise<string> {
  try {

    const inputs = await generateProofArtifacts(proofToVerify);

    console.log("proof Artifacts", inputs)

    console.log("recursivePoofInputs", inputs)

    toast.loading("Getting circuit... ⏳", {duration: 1_000_000, id: "get-circuit"});
    // Fails due to fetch on window not being defined
    //const circuit = (await getCircuit()).program as CompiledCircuit;
	  const circuit = circuitVerifyJSON as CompiledCircuit;
    toast.remove("get-circuit");

  	console.log("circuit", circuit)

    toast.loading("Generating noir circuit... ⏳", {duration: 1_000_000, id: "generate-noir-circuit"});
    const noir = new Noir(circuit);
    toast.remove("generate-noir-circuit");

    toast.loading("Generating witness... ⏳", {duration: 1_000_000, id: "generate-witness"});
    const { witness } = await noir.execute(inputs);
    toast.remove("generate-witness");

    toast.loading("Initializing backend... ⏳", {duration: 1_000_000, id: "initialize-backend"});
    const backend = new UltraHonkBackend(circuit.bytecode, { threads: 4 }, { recursive: true });
    toast.remove("initialize-backend");;
    
    toast.loading("Generating proof... ⏳", {duration: 1_000_000, id: "generate-proof"});
    const proof = await backend.generateProof(witness);
    toast.remove("generate-proof");
    
    toast.loading("Verifying proof... ⏳", {duration: 1_000_000, id: "verify-proof"});
    const isValid = await backend.verifyProof(proof);
    toast.remove("verify-proof");

    console.log("isValid", isValid)
  
    if (isValid) {
      toast.success("Proof verified successfully! 🎉", {duration: 100_000, id: "proof-verified"});
    } else {
      toast.error("Proof verification failed! 🚫", {duration: 100_000, id: "proof-verification-failed"});
    }
    
    return JSON.stringify(proof, null, 2);
  } catch (error: unknown) {
    toast.error("Failed to generate proof! 🚫", {duration: 10_000, id: "proof-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof: ${errorMessage}`);
  }
}  

// Deployment functionality is not implemented yet
/* 
export async function deployContract(circuitInfo?: Circuit) {
  try {
    const wallet = new Wallet(process.env.NEXT_PUBLIC_AZTEC_PRIVATE_KEY as string);

    const contract = await Contract.deploy(
      wallet, 
      MyContractArtifact, 
      [...constructorArgs])
    .send()
    .deployed();
    console.log(`Contract deployed at ${contract.address}`);

  } catch (error) {
    toast.error(`Error getting circuit: ${error}`, {duration: 10_000, id: "get-circuit-error"});
    throw error;
  }
}
*/
