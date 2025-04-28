import circuit from "./riddle.json";
import { Noir } from "@noir-lang/noir_js";
import { ProofData, UltraHonkBackend } from "@aztec/bb.js";

export default async function generate_proof(guess: number[], expected_hash: string): Promise<ProofData> {
  const fn = generate_proof.name;


  if (!guess.length) {
    throw new Error(`${fn}: received empty array ❌`);
  }

  console.log(`${fn}: guess received ${guess}`);

  try {
    // @ts-expect-error – no ideeeeaaa woaaaaaaa
    const noir = new Noir(circuit);
    const backend = new UltraHonkBackend(circuit.bytecode);

    console.log(`${fn}: generating witness… ⏳`);
    const { witness } = await noir.execute({ guess, expected_hash });
    console.log(`${fn}: witness generated ✅`);

    console.log(`${fn}: generating proof… ⏳`);
    const proof = await backend.generateProof(witness);
    console.log(`${fn}: proof generated ✅`);

    if (!backend.verifyProof(proof)) {
      throw new Error("invalid proof");
    }

    return proof;
  } catch (err) {
    const message =
      err instanceof Error
        ? `${fn}: ${err.message}`
        : `${fn}: unknown error`;

    throw new Error(message);
  }
}
