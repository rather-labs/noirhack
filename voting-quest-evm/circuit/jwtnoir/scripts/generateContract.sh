nargo compile #
bb write_vk --scheme ultra_honk -b ./target/jwtnoir.json -o ./target --oracle_hash keccak #
bb write_solidity_verifier --scheme ultra_honk -k ./target/vk -o ./target/jwtVerify.sol #