// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVerifier {
    function verify(bytes calldata proof, bytes32[] calldata publicInputs) external view returns (bool);
}

contract Quest {
    address public immutable verifier;
    bytes32 public immutable solutionHash;
    address public winner;
    uint256 public bounty;
    bool public solved;

    event QuestSolved(address indexed solver, uint256 bounty);
    event ProofSubmitted(address indexed solver, bool success);

    constructor(address _verifier, bytes32 _solutionHash) payable {
        require(msg.value > 0, "Bounty required");

        verifier = _verifier;
        solutionHash = _solutionHash;
        bounty = msg.value;
    }

    function submitProof(bytes calldata proof, bytes32[] calldata publicInputs) external {
        require(!solved, "Quest already solved");
        require(publicInputs.length == 1, "Invalid public input length");
        require(publicInputs[0] == solutionHash, "Public input does not match");

        bool ok = IVerifier(verifier).verify(proof, publicInputs);
        emit ProofSubmitted(msg.sender, ok);
        require(ok, "Proof verification failed");

        solved = true;
        winner = msg.sender;
        emit QuestSolved(msg.sender, bounty);
        payable(msg.sender).transfer(bounty);
    }

    function getMetadata() external view returns (
        address _verifier,
        bytes32 _solutionHash,
        address _winner,
        uint256 _bounty,
        bool _solved
    ) {
        return (verifier, solutionHash, winner, bounty, solved);
    }
}
