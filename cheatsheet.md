While writing circuits with Noir, use the following commands for each step:

1. `nargo check` creates `Prover.toml` with the params you've defined in your `main` fn
2. `nargo execute` will use the circuit source code and `Prover.toml` and it'll create the _witness_ and the ACIR representation of the circuit
3. `bb prove -b ./target/acir.json -w ./target/witness.gz -o target/proof` for proof creation
4. `bb write_vk -b ./target/acir.json -o target/vk` for verification key creation
5. `bb verify` for proof verification using vk and proof
6. `bb write_solidity_verifier -o contract.sol` for solidity verifier creation

* `bb compile` use this command for circuit compilation to ACIR
* `cat ./target/proof | od -An -v -t x1 | tr -d $' \n' | sed 's/^.\{8\}//'` use this command to fetch the actual content of the proof