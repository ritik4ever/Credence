// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";

interface ICredenceToken {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
}

contract CredencePolling is SelfVerificationRoot, Ownable, ReentrancyGuard {
    struct Poll {
        uint256 id;
        address creator;
        string title;
        string description;
        string category;
        string ipfsHash; // Walrus blob ID for detailed poll data
        uint256 rewardPerResponse;
        uint256 targetResponses;
        uint256 currentResponses;
        uint256 startTime;
        uint256 endTime;
        bool active;
        mapping(uint256 => bool) hasResponded; // nullifier => responded
    }

    struct WeeklyCompetition {
        uint256 week;
        uint256 startTime;
        uint256 endTime;
        string[] nominatedResponses; // Walrus blob IDs
        mapping(string => uint256) votes; // response hash => vote count
        mapping(address => bool) hasVoted;
        string winner;
        uint256 reward;
        bool ended;
    }

    ICredenceToken public credenceToken;
    bytes32 public verificationConfigId;
    
    uint256 public nextPollId = 1;
    uint256 public nextWeekId = 1;
    uint256 public platformFeePercent = 10; // 10%
    uint256 public weeklyCompetitionReward = 1000e18; // 1000 CRED
    
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => WeeklyCompetition) public weeklyCompetitions;
    mapping(address => uint256) public userRewards;
    mapping(address => bool) public verifiedUsers;
    
    // Events
    event PollCreated(uint256 indexed pollId, address indexed creator, uint256 reward);
    event PollResponse(uint256 indexed pollId, uint256 nullifier, uint256 reward);
    event WeeklyCompetitionStarted(uint256 indexed weekId, uint256 startTime);
    event WeeklyVote(uint256 indexed weekId, string responseHash, address voter);
    event WeeklyWinner(uint256 indexed weekId, string winner, uint256 reward);
    event UserVerified(address indexed user, uint256 nullifier);
    event RewardClaimed(address indexed user, uint256 amount);

    constructor(
        address _hubV2,
        string memory _scopeSeed,
        address _credenceToken,
        bytes32 _verificationConfigId
    ) SelfVerificationRoot(_hubV2, _scopeSeed) {
        credenceToken = ICredenceToken(_credenceToken);
        verificationConfigId = _verificationConfigId;
    }

    // Override required functions from SelfVerificationRoot
    function getConfigId(
        bytes32,
        bytes32,
        bytes memory
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        address user = address(uint160(output.userIdentifier));
        
        // Mark user as verified
        verifiedUsers[user] = true;
        
        emit UserVerified(user, output.nullifier);
        
        // Check if this is a poll response
        if (userData.length > 0) {
            (uint256 pollId, string memory responseHash) = abi.decode(userData, (uint256, string));
            _processPollResponse(pollId, output.nullifier, responseHash, user);
        }
    }

    function createPoll(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _ipfsHash,
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
        newPoll.ipfsHash = _ipfsHash;
        newPoll.rewardPerResponse = _rewardPerResponse;
        newPoll.targetResponses = _targetResponses;
        newPoll.currentResponses = 0;
        newPoll.startTime = block.timestamp;
        newPoll.endTime = block.timestamp + _duration;
        newPoll.active = true;
        
        emit PollCreated(pollId, msg.sender, _rewardPerResponse);
        
        // Refund excess payment
        if (msg.value > requiredPayment) {
            payable(msg.sender).transfer(msg.value - requiredPayment);
        }
    }

    function _processPollResponse(
        uint256 _pollId,
        uint256 _nullifier,
        string memory _responseHash,
        address _user
    ) internal {
        Poll storage poll = polls[_pollId];
        
        require(poll.active, "Poll not active");
        require(block.timestamp <= poll.endTime, "Poll ended");
        require(!poll.hasResponded[_nullifier], "Already responded");
        require(poll.currentResponses < poll.targetResponses, "Target reached");
        
        poll.hasResponded[_nullifier] = true;
        poll.currentResponses++;
        
        // Mint reward tokens
        credenceToken.mint(_user, poll.rewardPerResponse);
        userRewards[_user] += poll.rewardPerResponse;
        
        emit PollResponse(_pollId, _nullifier, poll.rewardPerResponse);
        
        // Check if poll is complete
        if (poll.currentResponses >= poll.targetResponses) {
            poll.active = false;
        }
    }

    function startWeeklyCompetition(string[] memory _nominatedResponses) external onlyOwner {
        uint256 weekId = nextWeekId++;
        
        WeeklyCompetition storage competition = weeklyCompetitions[weekId];
        competition.week = weekId;
        competition.startTime = block.timestamp;
        competition.endTime = block.timestamp + 7 days;
        competition.nominatedResponses = _nominatedResponses;
        competition.reward = weeklyCompetitionReward;
        competition.ended = false;
        
        emit WeeklyCompetitionStarted(weekId, block.timestamp);
    }

    function voteInWeeklyCompetition(uint256 _weekId, string memory _responseHash) external {
        require(verifiedUsers[msg.sender], "User not verified");
        
        WeeklyCompetition storage competition = weeklyCompetitions[_weekId];
        require(block.timestamp <= competition.endTime, "Voting ended");
        require(!competition.hasVoted[msg.sender], "Already voted");
        
        competition.votes[_responseHash]++;
        competition.hasVoted[msg.sender] = true;
        
        // Reward voter with small amount
        credenceToken.mint(msg.sender, 5e18); // 5 CRED for voting
        userRewards[msg.sender] += 5e18;
        
        emit WeeklyVote(_weekId, _responseHash, msg.sender);
    }

    function endWeeklyCompetition(uint256 _weekId) external onlyOwner {
        WeeklyCompetition storage competition = weeklyCompetitions[_weekId];
        require(block.timestamp > competition.endTime, "Competition not ended");
        require(!competition.ended, "Already ended");
        
        // Find winner (most votes)
        string memory winner;
        uint256 maxVotes = 0;
        
        for (uint256 i = 0; i < competition.nominatedResponses.length; i++) {
            string memory response = competition.nominatedResponses[i];
            if (competition.votes[response] > maxVotes) {
                maxVotes = competition.votes[response];
                winner = response;
            }
        }
        
        competition.winner = winner;
        competition.ended = true;
        
        // TODO: Mint reward to winner (need to track response -> user mapping)
        
        emit WeeklyWinner(_weekId, winner, competition.reward);
    }

    function claimRewards() external nonReentrant {
        uint256 amount = userRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        userRewards[msg.sender] = 0;
        
        // Transfer equivalent ETH value (simplified)
        uint256 ethAmount = amount / 1000; // 1000 CRED = 1 ETH (example rate)
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
        string memory ipfsHash,
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
            poll.ipfsHash,
            poll.rewardPerResponse,
            poll.targetResponses,
            poll.currentResponses,
            poll.startTime,
            poll.endTime,
            poll.active
        );
    }

    function hasUserResponded(uint256 _pollId, uint256 _nullifier) external view returns (bool) {
        return polls[_pollId].hasResponded[_nullifier];
    }

    // Admin functions
    function updateVerificationConfigId(bytes32 _newConfigId) external onlyOwner {
        verificationConfigId = _newConfigId;
    }

    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 20, "Fee too high"); // Max 20%
        platformFeePercent = _newFeePercent;
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Receive ETH
    receive() external payable {}
}