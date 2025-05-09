nargo compile #
bb write_vk --scheme ultra_honk -b ./target/riddle.json -o ./target --oracle_hash keccak #
bb write_solidity_verifier --scheme ultra_honk -k ./target/vk -o ./target/riddleVerify.sol #
mv ./target/riddleVerify.sol ../../contracts/contracts/RiddleVerifier.sol #
mv ./target/riddleVerify.json ../../frontend/src/config/abi/RiddleVerifier.json #