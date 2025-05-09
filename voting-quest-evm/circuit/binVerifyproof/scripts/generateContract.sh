nargo compile #
bb write_vk -b ./target/binVerifyproof.json -o ./target --oracle_hash keccak #
bb write_solidity_verifier -k ./target/vk -o ./target/proofVerify.sol #