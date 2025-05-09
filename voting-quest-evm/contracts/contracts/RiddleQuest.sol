// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

interface IVerifier {
    function verify(bytes calldata _proof, bytes32[] calldata _publicInputs) external view returns (bool);
}

contract RiddleQuestFactory {
    IVerifier public immutable verifier;

    mapping(uint256 => uint256) public bounties;
    mapping(uint256 => bytes32) public solutionHash;
    mapping(uint256 => string) public riddle;
    mapping(uint256 => bool) public solved;

    uint256 public questId;
    uint256 public lowerOpenQuestId;

    event QuestCreated(uint256 questId, uint256 bounty, bytes32 solutionHash);
    event QuestSolved(uint256 questId);
    event BountyClaimed(uint256 questId, address winner);
    constructor(IVerifier _verifier) payable {
        questId = 0;
        lowerOpenQuestId = 0;
        verifier = _verifier;
    }

    function submitGuess(
            bytes calldata _proof, 
            uint256 _questId
            ) external {

        require(!solved[_questId], "Quest already solved");

        bytes32[] memory publicInputs = new bytes32[](1);
        publicInputs[0] = solutionHash[_questId];

        try verifier.verify(_proof, publicInputs) {
            solved[_questId] = true;
            emit QuestSolved(_questId);
            if (_questId == lowerOpenQuestId) {
                while (solved[lowerOpenQuestId]) {
                    lowerOpenQuestId++;
                }
            }
        } catch {
            revert("Proof verification failed");
        }

    }
    function createRiddle(
            string memory _riddle,
            bytes32 _solutionHash
            ) external payable {
        require(msg.value > 0, "Bounty required");
        require(_solutionHash != bytes32(0), "Solution hash required");

        questId++;
        solutionHash[questId] = _solutionHash;
        riddle[questId] = _riddle;
        bounties[questId] = msg.value;
        if (lowerOpenQuestId == 0) {
            lowerOpenQuestId = questId;
        }
        emit QuestCreated(questId, msg.value, _solutionHash);
    }

    function getMetadata() external view returns (
        address _verifier,
        uint256 _questId,
        uint256 _lowerOpenQuestId
    ) {
        return (address(verifier), questId, lowerOpenQuestId);
    }

    function getQuestMetadata(uint256 _questId) external view returns (
        bytes32 _solutionHash,
        uint256 _bounty,
        string memory _riddle,
        bool _solved
    ) {
        return (solutionHash[_questId], 
                bounties[_questId], 
                riddle[_questId],
                solved[_questId]);
    }

}  
