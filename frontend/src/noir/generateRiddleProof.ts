import { Noir } from '@noir-lang/noir_js';
import type { InputMap } from '@noir-lang/types';
import { UltraHonkBackend } from '@aztec/bb.js';
import RiddleCircuitJSON from '../noir/circuits/riddle.json';
import { toHex } from 'viem';

export async function generateProof(inputs: InputMap, keccak = true) {
  // @ts-expect-error - this error is happening because the private parameter is kind array and expects an string
  // "type": { "kind": "array", "length": 6, "type": { "kind": "field" } }
  const noir = new Noir(RiddleCircuitJSON);
  const backend = new UltraHonkBackend(RiddleCircuitJSON.bytecode, {
    threads: 4,
  });

  const { witness } = await noir.execute(inputs);

  const proofData = await backend.generateProof(witness, { keccak });

  if (!backend.verifyProof(proofData)) {
    throw new Error('invalid proof');
  }

  const proofHex = toHex(proofData.proof);
  const publicInputsHex = proofData.publicInputs.map((pi) =>
    typeof pi === 'string'
      ? pi.startsWith('0x')
        ? pi
        : (`0x${pi}` as `0x${string}`)
      : toHex(pi)
  );

  return {
    proof: proofHex,
    publicInputs: publicInputsHex,
  };
}
