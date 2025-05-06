'use client';
import { Noir } from '@noir-lang/noir_js';
import type { CompiledCircuit, InputMap } from '@noir-lang/types';
import { UltraHonkBackend, Barretenberg, RawBuffer } from '@aztec/bb.js';
import circuitJSON from '@/public/circuit/jwtnoir/target/jwtnoir.json' assert { type: 'json' };
import circuitVerifyJSON from '@/public/circuit/binVerifyproof/target/binVerifyproof.json' assert { type: 'json' };
import { jwtVotingQuestContract } from '@/public/circuit/contractVerifyproof/src/artifacts/jwtVotingQuest';
import toast from "react-hot-toast";
import { AztecAddress,
         createPXEClient, 
         FeeJuicePaymentMethod,
         type FieldLike, 
         waitForPXE, 
         type Wallet, 
         type FeePaymentMethod, 
         type FieldsOf, 
        } from '@aztec/aztec.js';
import { getDeployedTestAccountsWallets } from '@aztec/accounts/testing';
import { Gas, GasFees, GasSettings } from '@aztec/stdlib/gas';


export type Circuit = {
  main: string;
  nargoToml: string;
}

export type ProofDataForRecursion = {
  /** @description Public inputs of a proof */
  publicInputs: string[];
  /** @description An byte array representing the proof */
  proof: string[];
};

export async function generateProof(inputs: InputMap): Promise<ProofDataForRecursion> {
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
    const backend = new UltraHonkBackend(circuit.bytecode, { threads: 4 }, { recursive: true });
    toast.remove("toast-message");
    
    toast.loading("Generating inner proof... ⏳", {duration: 1_000_000, id: "toast-message"});
    const proof = await backend.generateProofForRecursiveAggregation(witness);
    console.log("proof", proof)
    toast.remove("toast-message");
      
    return proof;
  } catch (error: unknown) {
    toast.remove("toast-message");
    toast.error("Failed to generate proof! 🚫", {duration: 10_000, id: "proof-generation-failed"});
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate proof: ${errorMessage}`);
  }
}  


export async function generateProofArtifacts(proofToVerify: ProofDataForRecursion, circuit?: CompiledCircuit): Promise<InputMap> {
  try {
    // taken from https://github.com/saleel/noir-recursion-example/tree/edfa6944673e2023f6db258996cf96a5d9d6a72a
    let innerCircuit = circuit;
    if (!innerCircuit) {
      toast.loading("Getting circuit... ⏳", {duration: 1_000_000, id: "toast-message"});
      // Fails due to fetch on window not being defined
      //const circuit = (await getCircuit()).program as CompiledCircuit;
	    innerCircuit = circuitJSON as CompiledCircuit;
      toast.remove("toast-message");
    }
    
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

export async function verifyProof(proofToVerify: ProofDataForRecursion): Promise<string> {
  try {

    const inputs = await generateProofArtifacts(proofToVerify);

    console.log("proof Artifacts", inputs)

    console.log("recursivePoofInputs", inputs)

    toast.loading("Getting circuit... ⏳", {duration: 1_000_000, id: "toast-message"});
    // Fails due to fetch on window not being defined
    //const circuit = (await getCircuit()).program as CompiledCircuit;
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

// Add this new function for casting votes
export async function castVoteOnChain(proof: ProofDataForRecursion, identifier: number, candidate: number) {
  try {
    // Get the proof artifacts that will be passed to the contract
    toast.loading("Generating proof artifacts... ⏳", {duration: 1_000_000, id: "toast-message"});
    const inputs = await generateProofArtifacts(proof);
    toast.remove("toast-message");
    
    // Convert identifier to number if it's a string
    const numericIdentifier = typeof identifier === 'string' ? Number(identifier) : identifier;
    
    // Connect to the PXE client - make sure it's running locally
    toast.loading("Connecting to PXE... ⏳", {duration: 1_000_000, id: "toast-message"});
    const pxe = createPXEClient(
      process.env.NEXT_PUBLIC_PXE_URL || 'http://localhost:8080',
    );
    await waitForPXE(pxe);
    toast.remove("toast-message");
    // This should be replaced with a proper wallet connection
    // For now we use a test wallet with some funds for demo purposes
    let wallet: Wallet;
    try {
      // In production, you would get this from the user's wallet
      const privateKey = process.env.NEXT_PUBLIC_AZTEC_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("No private key available");
      }
      toast.loading("Getting wallet... ⏳", {duration: 1_000_000, id: "toast-message"});
      //wallet =
      //  await getWallet(pxe, 
      //  { accountAlias: "account:test0" }
      //  //AztecAddress.fromString("0x1b35884f8ba9371419d00ae228da9ff839edfe8fe6a804fdfcd430e0dc7e40db"),
      //);
      wallet = (await getDeployedTestAccountsWallets(pxe))[0];
      toast.remove("toast-message");
    } catch (error) {
      toast.remove("toast-message");
      console.error("Failed to create wallet:", error);
      throw new Error("Failed to connect wallet. Make sure Aztec sandbox is running and you have a wallet set up.");
    }
    
    
    toast.loading("Casting vote on chain... ⏳", {duration: 1_000_000, id: "toast-message"});
    
    // The contract address should come from your deployed contract
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error("Contract address not available");
    }
    
    // Get the contract instance
    const contract = await jwtVotingQuestContract.at(AztecAddress.fromString(contractAddress), wallet);
    
    console.log("contract", contract)
    console.log("inputs", inputs)
    console.log("numericIdentifier", numericIdentifier)
    console.log("candidate", candidate)

    // 1)  Build the limits ― generous but within protocol max (6 M L2) …
    const gasLimits          = new Gas(0, 6_000_000);        // DA 0, L2 6 M
    const teardownGasLimits  = Gas.empty();                     // no teardown

    // 2)  0‑fee on Sandbox.  On testnet replace 0n with e.g. 1_000_000_000n
    const maxFeesPerGas        = GasFees.empty();           // DA, L2 (wei/gas)
    const maxPriorityFeesPerGas = GasFees.empty();                  // no tip

    // 3)  Bundle them
    const gasSettings = new GasSettings(
      gasLimits,
      teardownGasLimits,
      maxFeesPerGas,
      maxPriorityFeesPerGas,
    );
    //const gasSettings = {
    //  gasLimits:            { daGas: 0n,  l2Gas: 600_000n },
    //  teardownGasLimits:    { daGas: 0n,  l2Gas: 0n },
    //  maxFeesPerGas:        { daFeePerDaGas: 0n,  l2FeePerDaGas: 0n },
    //  maxPriorityFeesPerGas:{ daFeePerDaGas: 0n,  l2FeePerDaGas: 0n },
    //}

    // 4)  Choose how you’ll *pay* (here: pay directly from your fee‑juice balance)
    const paymentMethod = new FeeJuicePaymentMethod(wallet.getAddress());

    //export type UserFeeOptions = {
    ///** The fee payment method to use */
    //paymentMethod?: FeePaymentMethod;
    ///** The gas settings */
    //gasSettings?: Partial<FieldsOf<GasSettings>>;
    ///** Percentage to pad the base fee by, if empty, defaults to 0.5 */
    //baseFeePadding?: number;
    ///** Whether to run an initial simulation of the tx with high gas limit to figure out actual gas settings. */
    //estimateGas?: boolean;
    ///** Percentage to pad the estimated gas limits by, if empty, defaults to 0.1. Only relevant if estimateGas is set. */
    //estimatedGasPadding?: number;

    // Call the cast_vote function
    const tx = await contract.methods.cast_vote(
      inputs.verification_key as FieldLike[],
      inputs.proof as FieldLike[],
      inputs.public_inputs as FieldLike[],
      numericIdentifier as FieldLike,
      candidate as FieldLike
    ).send(
      { fee : {
        gasSettings: gasSettings as Partial<FieldsOf<GasSettings>>,
        paymentMethod, 
        estimateGas: false
        }
      }
    ).wait();
    //).send().wait();

    console.log("tx", tx)
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

// Add this new function for casting votes
export async function getDescription(): Promise<string> {
  try {
    // Connect to the PXE client - make sure it's running locally
    toast.loading("Connecting to PXE... ⏳", {duration: 1_000_000, id: "toast-message"});
    const pxe = createPXEClient(
      process.env.NEXT_PUBLIC_PXE_URL || 'http://localhost:8080',
    );
    await waitForPXE(pxe);
    toast.remove("toast-message");
    // This should be replaced with a proper wallet connection
    // For now we use a test wallet with some funds for demo purposes
    let wallet: Wallet;
    try {
      // In production, you would get this from the user's wallet
      const privateKey = process.env.NEXT_PUBLIC_AZTEC_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("No private key available");
      }
      toast.loading("Getting wallet... ⏳", {duration: 1_000_000, id: "toast-message"});
      //wallet =
      //  await getWallet(pxe, 
      //  { accountAlias: "account:test0" }
      //  //AztecAddress.fromString("0x1b35884f8ba9371419d00ae228da9ff839edfe8fe6a804fdfcd430e0dc7e40db"),
      //);
      wallet = (await getDeployedTestAccountsWallets(pxe))[0];
      toast.remove("toast-message");
    } catch (error) {
      toast.remove("toast-message");
      console.error("Failed to create wallet:", error);
      throw new Error("Failed to connect wallet. Make sure Aztec sandbox is running and you have a wallet set up.");
    }
    
    toast.loading("Casting vote on chain... ⏳", {duration: 1_000_000, id: "toast-message"});
    
    // The contract address should come from your deployed contract
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error("Contract address not available");
    }
    
    // Get the contract instance
    const contract = await jwtVotingQuestContract.at(AztecAddress.fromString(contractAddress), wallet);
    
    console.log("contract", contract)
   
    // Call the cast_vote function
    const tx = await contract.methods.get_description().simulate();

    // Convert BigInt array to number array first, then to Uint8Array
    const resultString = Buffer.from(tx.map((bigintValue: bigint) => Number(bigintValue))).toString('utf8');
    
    toast.remove("toast-message");
    toast.success("Description retrieved successfully! 🎉", {duration: 5000});

    // Return the string representation of the description
    return resultString;
    
  } catch (error: unknown) {
    toast.remove("toast-message");
    toast.error(`Failed to cast vote: ${error instanceof Error ? error.message : String(error)}`, {duration: 10000});
    throw error;
  }
}