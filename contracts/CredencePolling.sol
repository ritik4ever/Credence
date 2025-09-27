// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ISelfVerificationHub.sol";

interface ICredenceToken {
    function mint(address to, uint256 amount) external;
}

contract CredencePolling is Ownable, ReentrancyGuard {
    struct Poll {
        uint256 id;
        address creator;
        string title;
        string description;
        string category;
        string walrusHash;
        uint256 rewardPerResponse;
        uint256 targetResponses;
        uint256 currentResponses;
        uint256 startTime;
        uint256 endTime;
        bool active;
        mapping(uint256 => bool) nullifierUsed;
    }

    struct WeeklyCompetition {
        uint256 week;
        uint256 startTime;
        uint256 endTime;
        string[] nominatedResponses;
        mapping(string => uint256) votes;
        mapping(address => bool) hasVoted;
        string winner;
        uint256 reward;
        bool ended;
    }

    ISelfVerificationHub public selfHub;
    ICredenceToken public credenceToken;
    
    uint256 public nextPollId = 1;
    uint256 public nextWeekId = 1;
    uint256 public platformFeePercent = 10;
    uint256 public weeklyCompetitionReward = 1000e18;
    
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => WeeklyCompetition) public weeklyCompetitions;
    mapping(address => uint256) public userRewards;
    mapping(uint256 => bool) public globalNullifiers; // Track all used nullifiers
    
    event PollCreated(uint256 indexed pollId, address indexed creator, uint256 reward);
    event PollResponse(uint256 indexed pollId, uint256 nullifier, uint256 reward, address user);
    event UserVerified(address indexed user, uint256 nullifier);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(address _selfHub, address _credenceToken) {
        selfHub = ISelfVerificationHub(_selfHub);
        credenceToken = ICredenceToken(_credenceToken);
    }

    function createPoll(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _walrusHash,
        uint256 _rewardPerResponse,
        uint256 _targetResponses,
        uint256 _duration
    ) external payable {
        require(bytes(_title).length > 0, "Title required");
        require(_targetResponses > 0, "Target responses must be > 0");
        require(_duration > 0, "Duration must be > 0");
        
        uint256 totalReward = _rewardPerResponse * _targetResponses;
        uint256 platformFee = (totalReward * platformFeePercent) / 100;
        uint256 requiredPayment = totalReward + platformFee;
        
        require(msg.value >= requiredPayment, "Insufficient payment");
        
        uint256 pollId = nextPollId++;
        
        Poll storage newPoll = polls[pollId];
        newPoll.id = pollId;
        newPoll.creator = msg.sender;
        newPoll.title = _title;
        newPoll.description = _description;
        newPoll.category = _category;
        newPoll.walrusHash = _walrusHash;
        newPoll.rewardPerResponse = _rewardPerResponse;
        newPoll.targetResponses = _targetResponses;
        newPoll.currentResponses = 0;
        newPoll.startTime = block.timestamp;
        newPoll.endTime = block.timestamp + _duration;
        newPoll.active = true;
        
        emit PollCreated(pollId, msg.sender, _rewardPerResponse);
        
        if (msg.value > requiredPayment) {
            payable(msg.sender).transfer(msg.value - requiredPayment);
        }
    }

    function respondToPollWithVerification(
        uint256 _pollId,
        string memory _responseHash,
        bytes calldata _proof,
        uint256[] calldata _publicSignals,
        bytes calldata _userContextData
    ) external {
        Poll storage poll = polls[_pollId];
        require(poll.active, "Poll not active");
        require(block.timestamp <= poll.endTime, "Poll ended");
        require(poll.currentResponses < poll.targetResponses, "Target reached");

        // Verify with Self Protocol
        ISelfVerificationHub.VerificationResult memory result = selfHub.verifyProof(
            _proof,
            _publicSignals,
            _userContextData
        );

        require(result.success, "Self verification failed");
        require(result.ageAbove18, "Must be 18 or older");
        require(!globalNullifiers[result.nullifier], "Nullifier already used globally");
        require(!poll.nullifierUsed[result.nullifier], "Already responded to this poll");

        // Mark nullifier as used
        globalNullifiers[result.nullifier] = true;
        poll.nullifierUsed[result.nullifier] = true;
        poll.currentResponses++;

        // Get user address from userIdentifier
        address user = address(uint160(result.userIdentifier));

        // Mint rewards
        credenceToken.mint(user, poll.rewardPerResponse);
        userRewards[user] += poll.rewardPerResponse;

        emit PollResponse(_pollId, result.nullifier, poll.rewardPerResponse, user);
        emit UserVerified(user, result.nullifier);

        // Check if poll is complete
        if (poll.currentResponses >= poll.targetResponses) {
            poll.active = false;
        }
    }

    function claimRewards() external nonReentrant {
        uint256 amount = userRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        userRewards[msg.sender] = 0;
        
        // Convert CRED to ETH (simplified rate)
        uint256 ethAmount = amount / 1000; // 1000 CRED = 1 ETH
        require(address(this).balance >= ethAmount, "Insufficient contract balance");
        
        payable(msg.sender).transfer(ethAmount);
        
        emit RewardClaimed(msg.sender, amount);
    }

    // View functions
    function getPoll(uint256 _pollId) external view returns (
        uint256 id,
        address creator,
        string memory title,
        string memory description,
        string memory category,
        string memory walrusHash,
        uint256 rewardPerResponse,
        uint256 targetResponses,
        uint256 currentResponses,
        uint256 startTime,
        uint256 endTime,
        bool active
    ) {
        Poll storage poll = polls[_pollId];
        return (
            poll.id,
            poll.creator,
            poll.title,
            poll.description,
            poll.category,
            poll.walrusHash,
            poll.rewardPerResponse,
            poll.targetResponses,
            poll.currentResponses,
            poll.startTime,
            poll.endTime,
            poll.active
        );
    }

    function isNullifierUsed(uint256 _nullifier) external view returns (bool) {
        return globalNullifiers[_nullifier];
    }

    function hasRespondedToPoll(uint256 _pollId, uint256 _nullifier) external view returns (bool) {
        return polls[_pollId].nullifierUsed[_nullifier];
    }

    // Admin functions
    function updateSelfHub(address _newHub) external onlyOwner {
        selfHub = ISelfVerificationHub(_newHub);
    }

    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 20, "Fee too high");
        platformFeePercent = _newFeePercent;
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}