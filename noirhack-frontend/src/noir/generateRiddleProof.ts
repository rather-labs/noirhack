import circuit from './circuits/riddle.json';
import { Noir } from '@noir-lang/noir_js';
import { toHex } from '../utils';
import { UltraHonkBackend } from '@aztec/bb.js';

export type Field = string | number | boolean;

interface GenerateProofParams {
  privateInput: Field[];
  publicInputs: `0x${string}`;
}

export async function generateProof({
  privateInput,
  publicInputs,
}: GenerateProofParams) {
  // @ts-expect-error - this error is happening because the private parameter is kind array and expects an string
  // "type": { "kind": "array", "length": 6, "type": { "kind": "field" } }
  const noir = new Noir(circuit);
  const backend = new UltraHonkBackend(circuit.bytecode);

  const { witness } = await noir.execute({
    guess: privateInput,
    expected_hash: publicInputs,
  });

  const proofData = await backend.generateProof(witness);

  const proofHex = toHex(proofData.proof);
  const publicInputsHex = proofData.publicInputs.map((pi) =>
    typeof pi === 'string'
      ? pi.startsWith('0x')
        ? pi
        : (`0x${pi}` as `0x${string}`)
      : toHex(pi)
  );

  if (!backend.verifyProof(proofData)) {
    throw new Error('invalid proof');
  }

  return { proof: proofHex, publicInputs: publicInputsHex };
}
