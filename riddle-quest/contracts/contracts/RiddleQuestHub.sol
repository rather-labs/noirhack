// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IVerifier {
    function verify(
        bytes calldata proof,
        bytes32[] calldata pubInputs
    ) external view returns (bool);
}

contract RiddleQuestHub {
    struct Quest {
        string title;
        string prompt;
        bytes32 solutionHash;
        uint256 bounty;
        uint256 deadline;
        address winner;
        bool solved;
    }

    IVerifier public immutable verifier;

    uint256 public nextQuestId;
    mapping(uint256 => Quest) private quests;

    event QuestCreated(
        uint256 indexed questId,
        string title,
        uint256 bounty,
        uint256 deadline
    );
    event ProofAttempt(
        uint256 indexed questId,
        address indexed solver,
        bool ok
    );
    event QuestSolved(
        uint256 indexed questId,
        address indexed solver,
        uint256 bounty
    );

    constructor(IVerifier _verifier) {
        verifier = _verifier;
    }

    /// @notice Create a new riddle quest and fund the bounty.
    function createRiddle(
        string calldata _title,
        string calldata _prompt,
        bytes32 _solutionHash,
        uint256 _deadline // 0 for no deadline
    ) external payable returns (uint256 questId) {
        require(msg.value > 0, "Bounty required");
        require(_solutionHash != bytes32(0), "Solution hash required");
        if (_deadline != 0)
            require(_deadline > block.timestamp, "Deadline in past");

        questId = ++nextQuestId;

        quests[questId] = Quest({
            title: _title,
            prompt: _prompt,
            solutionHash: _solutionHash,
            bounty: msg.value,
            deadline: _deadline,
            winner: address(0),
            solved: false
        });

        emit QuestCreated(questId, _title, msg.value, _deadline);
    }

    /// @notice Submit a zero‑knowledge proof for quest `questId`.
    function submitProof(uint256 questId, bytes calldata proof) external {
        Quest storage q = quests[questId];
        require(!q.solved, "Quest solved");
        if (q.deadline != 0)
            require(block.timestamp <= q.deadline, "Quest expired");

        bytes32[] memory publicInputs = new bytes32[](1);
        publicInputs[0] = q.solutionHash;

        bool ok = verifier.verify(proof, publicInputs);
        emit ProofAttempt(questId, msg.sender, ok);
        require(ok, "Verification failed");

        q.solved = true;
        q.winner = msg.sender;

        emit QuestSolved(questId, msg.sender, q.bounty);

        (bool sent, ) = payable(msg.sender).call{value: q.bounty}("");
        require(sent, "ETH transfer failed");
    }

    function status(uint256 questId) public view returns (uint8) {
        Quest storage q = quests[questId];
        if (q.solved) return 1; // SOLVED
        if (q.deadline != 0 && block.timestamp > q.deadline) return 2; // EXPIRED
        return 0; // OPEN
    }

    function getQuest(
        uint256 questId
    )
        external
        view
        returns (
            string memory title,
            string memory prompt,
            uint256 bounty,
            uint256 deadline,
            uint8 _status,
            address winner
        )
    {
        Quest storage q = quests[questId];
        return (
            q.title,
            q.prompt,
            q.bounty,
            q.deadline,
            status(questId),
            q.winner
        );
    }
}
