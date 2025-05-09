// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVerifier {
    function verify(
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external view returns (bool);
}

contract RiddleQuest {
    address public immutable verifier;
    bytes32 public immutable solutionHash;

    string public title;
    string public prompt;
    uint256 public deadline; // 0 = no deadline

    uint256 public bounty;
    address public winner;
    bool public solved;

    enum Status {
        OPEN,
        SOLVED,
        EXPIRED
    }

    function status() public view returns (Status) {
        if (solved) return Status.SOLVED;
        if (deadline != 0 && block.timestamp > deadline) return Status.EXPIRED;
        return Status.OPEN;
    }

    event QuestInitialized(string title, uint256 bounty, uint256 deadline);
    event ProofAttempt(address indexed solver, bool ok);
    event QuestSolved(address indexed solver, uint256 bounty);

    constructor(
        address _verifier,
        bytes32 _solutionHash,
        string memory _title,
        string memory _prompt,
        uint256 _deadline
    ) payable {
        require(msg.value > 0, "Bounty required");
        verifier = _verifier;
        solutionHash = _solutionHash;

        title = _title;
        prompt = _prompt;
        deadline = _deadline;
        bounty = msg.value;

        emit QuestInitialized(_title, msg.value, _deadline);
    }

    function submitProof(
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external {
        require(status() == Status.OPEN, "Quest not open");
        require(_publicInputs.length == 1, "Bad public input length");
        require(_publicInputs[0] == solutionHash, "Public input mismatch");

        bool ok = IVerifier(verifier).verify(_proof, _publicInputs);
        emit ProofAttempt(msg.sender, ok);
        require(ok, "Verification failed");

        solved = true;
        winner = msg.sender;

        emit QuestSolved(msg.sender, bounty);

        (bool sent, ) = payable(msg.sender).call{value: bounty}("");
        require(sent, "ETH transfer failed");
    }

    function getFullMetadata()
        external
        view
        returns (
            string memory _title,
            string memory _prompt,
            uint256 _bounty,
            uint256 _deadline,
            Status _status,
            address _winner
        )
    {
        return (title, prompt, bounty, deadline, status(), winner);
    }
}
