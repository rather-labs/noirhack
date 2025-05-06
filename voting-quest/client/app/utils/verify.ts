import { Noir } from '@noir-lang/noir_js';
import { CompiledCircuit, InputMap } from '@noir-lang/types';
import { UltraHonkBackend } from '@aztec/bb.js';

export async function generate_proof(
  circuit: CompiledCircuit, 
  args: InputMap) 
{
  const noir = new Noir(circuit);
  const backend = new UltraHonkBackend(circuit.bytecode);

  const { witness } = await noir.execute(args);

  const proof = await backend.generateProof(witness);
  const isValid = await backend.verifyProof(proof);
  console.log(isValid);
}

