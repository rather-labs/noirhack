// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {HonkVerifier} from "./JwtVerifier.sol";

contract VotingQuestFactory {
    address public immutable verifier;
    mapping(uint256 => mapping(uint256 => uint256)) public voteCandidates;
    mapping(uint256 => mapping(bytes32 => uint256)) public voteSecrets;
    mapping(uint256 => bytes32) public winnerSecret;
    mapping(uint256 => uint256) public bounties;
    mapping(uint256 => uint256) public questObjective;
    mapping(uint256 => bool) public solved;

    uint256 public questId;

    event QuestCreated(uint256 questId, uint256 bounty, uint256 questObjective);
    event QuestSolved(uint256 questId, bytes32 winnerSecret);
    event ProofSubmitted(uint256 questId, uint256 voteCandidate, bytes32 voteSecret);
    event BountyClaimed(uint256 questId, address winner);
    constructor() payable {
        questId = 0;
    }

    function submitVote(
            bytes calldata _proof, 
            bytes32[] calldata _publicInputs, 
            uint256 _questId, 
            uint256 _voteCandidate, 
            bytes32 _voteSecret
            ) external {
        require(!solved[_questId], "Quest already solved");
        require(_publicInputs.length == 18, "Invalid public input length");
        
        bool ok = HonkVerifier(verifier).verify(_proof, _publicInputs);

        voteCandidates[_questId][_voteCandidate]++;
        voteSecrets[_questId][_voteSecret]++;
        emit ProofSubmitted(_questId, _voteCandidate, _voteSecret);
        require(ok, "Proof verification failed");

        if (voteSecrets[_questId][_voteSecret] >= questObjective[_questId]) {
            solved[_questId] = true;
            winnerSecret[_questId] = _voteSecret;
            emit QuestSolved(_questId, _voteSecret);
        }
    }

    function claimBounty(
            bytes calldata _secret, 
            uint256 _questId
            ) external {
        require(solved[_questId], "Quest not solved");
        require(winnerSecret[_questId] == keccak256(_secret), "Invalid secret");
        
        uint256 _bounty = bounties[_questId];
        bounties[_questId] = 0;
        payable(msg.sender).transfer(_bounty);
        emit BountyClaimed(_questId, msg.sender);
    }

    function createQuest(
            uint256 _bounty, 
            uint256 _questObjective
            ) external {
        require(_bounty > 0, "Bounty required");
        require(_questObjective > 0, "Quest objective required");

        questId++;
        bounties[questId] = _bounty;
        questObjective[questId] = _questObjective;
        emit QuestCreated(questId, _bounty, _questObjective);
    }


    function getMetadata(uint256 _questId) external view returns (
        address _verifier,
        bytes32 _winnerSecret,
        uint256 _bounty,
        bool _solved
    ) {
        return (verifier, winnerSecret[_questId], bounties[_questId], solved[_questId]);
    }
}
