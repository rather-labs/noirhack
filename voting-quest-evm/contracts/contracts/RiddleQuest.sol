// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

interface IVerifier {
    function verify(bytes calldata _proof, bytes32[] calldata _publicInputs) external view returns (bool);
}

import "hardhat/console.sol";
contract VotingQuestFactory {
    IVerifier public immutable verifier;

    mapping(uint256 => uint256) public bounties;
    mapping(uint256 => bytes32) public solutionHash;
    mapping(uint256 => bool) public solved;

    uint256 public questId;
    uint256 public lowerOpenQuestId;

    event QuestCreated(uint256 questId, uint256 bounty, uint256 questObjective);
    event QuestSolved(uint256 questId, bytes32 winnerSecret);
    event ProofSubmitted(uint256 questId, uint256 voteCandidate, bytes32 voteSecret);
    event BountyClaimed(uint256 questId, address winner);
    constructor(IVerifier _verifier) payable {
        questId = 0;
        lowerOpenQuestId = 0;
        verifier = _verifier;
    }

    function submitGuess(
            bytes calldata _proof, 
            bytes32[] calldata _publicInputs, 
            ) external {
        require(!solved[_questId], "Quest already solved");
        require(_publicInputs.length == 1, "Invalid public input length");

        console.log("Verifying proof");
        
        try verifier.verify(_proof, _publicInputs) {
            console.log("Proof verified");
        } catch Error(string memory reason) {
            console.log("Proof verification failed");
            revert(reason);
        }

        emit ProofSubmitted(_questId, _voteCandidate, _voteSecret);

        if (voteSecrets[_questId][_voteSecret] >= questObjective[_questId]) {
            solved[_questId] = true;
            winnerSecret[_questId] = _voteSecret;
            emit QuestSolved(_questId, _voteSecret);
            if (_questId == lowerOpenQuestId) {
                while (solved[lowerOpenQuestId]) {
                    lowerOpenQuestId++;
                }
            }
        }
    }
    function createRiddle(
            uint256 _bounty, 
            bytes32 _solutionHash
            ) external {
        require(_bounty > 0, "Bounty required");
        require(_solutionHash != bytes32(0), "Solution hash required");

        questId++;
        bounties[questId] = _bounty;
        questObjective[questId] = _questObjective;
        if (lowerOpenQuestId == 0) {
            lowerOpenQuestId = questId;
        }
        emit QuestCreated(questId, _bounty, _solutionHash);
    }

    function getMetadata() external view returns (
        address _verifier,
        uint256 _questId,
        uint256 _lowerOpenQuestId
    ) {
        return (address(verifier), questId, lowerOpenQuestId);
    }

    function getQuestMetadata(uint256 _questId) external view returns (
        bytes32 _winnerSecret,
        uint256 _bounty,
        uint256 _questObjective,
        bool _solved
    ) {
        return (winnerSecret[_questId], 
                bounties[_questId], 
                questObjective[_questId],
                solved[_questId]);
    }

}  
