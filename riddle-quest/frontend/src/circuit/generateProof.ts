import circuit from './riddle.json';
import { Noir } from '@noir-lang/noir_js';
import { ProofData, UltraHonkBackend } from '@aztec/bb.js';

export async function generateProof(
  guess: number[],
  expected_hash: string
): Promise<ProofData> {
  const fn = generateProof.name;

  if (!guess.length) {
    throw new Error(`${fn}: received empty array ❌`);
  }

  console.log(`${fn}: guess received ${guess}`);

  try {
    // @ts-expect-error – no ideeeeaaa woaaaaaaa
    const noir = new Noir(circuit);
    const honkBackend = new UltraHonkBackend(circuit.bytecode);

    console.log(`${fn}: generating witness… ⏳`);
    const { witness } = await noir.execute({ guess, expected_hash });
    console.log(`${fn}: witness generated ✅`);

    console.log(`${fn}: generating proof… ⏳`);
    const proofData = await honkBackend.generateProof(witness);
    console.log(`${fn}: proof generated ✅`);

    if (!honkBackend.verifyProof(proofData)) {
      throw new Error('invalid proof');
    }

    return proofData;
  } catch (err) {
    const message =
      err instanceof Error ? `${fn}: ${err.message}` : `${fn}: unknown error`;

    throw new Error(message);
  }
}
