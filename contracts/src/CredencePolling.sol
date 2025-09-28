// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { SelfVerificationRoot } from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import { ISelfVerificationRoot } from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import { SelfStructs } from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import { SelfUtils } from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import { IIdentityVerificationHubV2 } from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";

interface ICredenceToken {
    function mint(address to, uint256 amount) external;
}

interface IWalrusStorage {
    function storeData(string memory _blobId, string memory _dataType) external;
}

contract CredencePolling is Ownable, ReentrancyGuard, SelfVerificationRoot {
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
        uint256 optionCount;
        mapping(address => bool) hasResponded;
        mapping(uint256 => bool) nullifierUsed;
        mapping(uint256 => uint256) optionVotes;
        mapping(uint256 => string) options;
    }

    struct PollInfo {
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
    }

    struct CreatePollParams {
        string title;
        string description;
        string category;
        string[] options;
        uint256 rewardPerResponse;
        uint256 targetResponses;
        uint256 duration;
    }

    struct UserProfile {
        bool isVerified;
        uint256 verifiedAt;
        uint256 totalResponses;
        uint256 totalEarned;
        uint256 nullifier;
    }

    struct WeeklyNominationData {
        address nominee;
        string reason;
        uint256 votes;
        uint256 week;
    }

    ICredenceToken public credenceToken;
    IWalrusStorage public walrusStorage;
    address public immutable identityVerificationHubV2;
    
    uint256 public nextPollId = 1;
    uint256 public platformFeePercent = 10;
    bytes32 public verificationConfigId;
    
    // Weekly competition tracking
    uint256 public currentWeek;
    uint256 public weeklyPrizePool = 1000e18;
    mapping(uint256 => WeeklyNominationData[]) public weeklyNominations;
    mapping(address => bool) public isSubscriber;
    
    mapping(uint256 => Poll) public polls;
    mapping(address => UserProfile) public userProfiles;
    mapping(address => uint256) public userRewards;
    mapping(uint256 => bool) public globalNullifiers;
    
    mapping(uint256 => bytes32) public configs;
    
    event PollCreated(uint256 indexed pollId, address indexed creator, uint256 reward, string walrusHash);
    event PollResponse(uint256 indexed pollId, address indexed user, uint256 optionIndex, uint256 reward, uint256 nullifier);
    event UserVerified(address indexed user, uint256 timestamp, uint256 nullifier);
    event RewardClaimed(address indexed user, uint256 amount);
    event WeeklyNomination(address indexed nominee, address indexed nominator, string reason, uint256 week);
    event SubscriptionPurchased(address indexed user, uint256 amount);

    // ✅ FIXED: Keep uint256 scopeSeed (matches your Self Protocol version)
    constructor(
        address _identityVerificationHubV2,
        uint256 scopeSeed,  // ✅ Keeping uint256 as your version expects this
        address _credenceToken,
        address _walrusStorage
    ) Ownable(msg.sender) SelfVerificationRoot(_identityVerificationHubV2, scopeSeed) {
        identityVerificationHubV2 = _identityVerificationHubV2;
        credenceToken = ICredenceToken(_credenceToken);
        walrusStorage = IWalrusStorage(_walrusStorage);
        
        // ✅ SIMPLIFIED: More permissive verification config for testing
        string[] memory forbiddenCountries = new string[](0); // Empty array - no country restrictions
        
        SelfUtils.UnformattedVerificationConfigV2 memory rawConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 0,           // ✅ No age requirement for testing
            forbiddenCountries: forbiddenCountries, // ✅ No country restrictions
            ofacEnabled: false      // ✅ Disabled OFAC for easier testing
        });
        
        // Format and register with hub to get proper config ID
        SelfStructs.VerificationConfigV2 memory verificationConfig = 
            SelfUtils.formatVerificationConfigV2(rawConfig);
            
        verificationConfigId = 
            IIdentityVerificationHubV2(_identityVerificationHubV2)
            .setVerificationConfigV2(verificationConfig);
            
        currentWeek = block.timestamp / 1 weeks;
    }

    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal virtual override {
        address user = address(uint160(output.userIdentifier));
        
        require(!globalNullifiers[output.nullifier], "Nullifier already used");
        
        globalNullifiers[output.nullifier] = true;
        
        userProfiles[user] = UserProfile({
            isVerified: true,
            verifiedAt: block.timestamp,
            totalResponses: userProfiles[user].totalResponses,
            totalEarned: userProfiles[user].totalEarned,
            nullifier: output.nullifier
        });
        
        emit UserVerified(user, block.timestamp, output.nullifier);
    }

    function getConfigId(
        bytes32 /* destinationChainId */,
        bytes32 /* userIdentifier */,
        bytes memory userDefinedData
    ) public view override returns (bytes32) {
        if (userDefinedData.length > 0) {
            uint256 key = uint256(keccak256(userDefinedData));
            bytes32 dynamicConfigId = configs[key];
            if (dynamicConfigId != bytes32(0)) {
                return dynamicConfigId;
            }
        }
        return verificationConfigId;
    }

    // ✅ ADDED: Function to create stricter configs later
    function setStrictVerificationConfig() external onlyOwner {
        string[] memory forbiddenCountries = new string[](3);
        forbiddenCountries[0] = "PRK"; // North Korea
        forbiddenCountries[1] = "IRN"; // Iran
        forbiddenCountries[2] = "SYR"; // Syria
        
        SelfUtils.UnformattedVerificationConfigV2 memory strictConfig = SelfUtils.UnformattedVerificationConfigV2({
            olderThan: 18,
            forbiddenCountries: forbiddenCountries,
            ofacEnabled: true
        });
        
        SelfStructs.VerificationConfigV2 memory verificationConfig = 
            SelfUtils.formatVerificationConfigV2(strictConfig);
            
        verificationConfigId = 
            IIdentityVerificationHubV2(identityVerificationHubV2)
            .setVerificationConfigV2(verificationConfig);
    }

    function setConfig(
        string memory configDesc,
        SelfUtils.UnformattedVerificationConfigV2 memory config
    ) external onlyOwner {
        uint256 key = uint256(keccak256(bytes(configDesc)));
        
        SelfStructs.VerificationConfigV2 memory verificationConfig = 
            SelfUtils.formatVerificationConfigV2(config);
            
        bytes32 configId = 
            IIdentityVerificationHubV2(identityVerificationHubV2)
            .setVerificationConfigV2(verificationConfig);
            
        configs[key] = configId;
    }

    modifier onlyVerifiedUser() {
        require(userProfiles[msg.sender].isVerified, "Must complete Self Protocol verification");
        _;
    }

    modifier onlySubscriber() {
        require(isSubscriber[msg.sender], "Subscriber required");
        _;
    }

    // Rest of your functions remain the same...
    function createPoll(CreatePollParams memory params) external payable onlyVerifiedUser {
        require(bytes(params.title).length > 0, "Title required");
        require(params.options.length >= 2 && params.options.length <= 6, "2-6 options required");
        require(params.targetResponses > 0, "Target responses must be > 0");
        require(params.duration > 0, "Duration must be > 0");
        
        uint256 totalReward = params.rewardPerResponse * params.targetResponses;
        uint256 platformFee = (totalReward * platformFeePercent) / 100;
        uint256 requiredPayment = totalReward + platformFee;
        
        require(msg.value >= requiredPayment, "Insufficient payment");
        
        uint256 pollId = nextPollId++;
        
        string memory walrusHash = string(abi.encodePacked("poll_", uint2str(pollId), "_", uint2str(block.timestamp)));
        walrusStorage.storeData(walrusHash, "poll");
        
        Poll storage newPoll = polls[pollId];
        newPoll.id = pollId;
        newPoll.creator = msg.sender;
        newPoll.title = params.title;
        newPoll.description = params.description;
        newPoll.category = params.category;
        newPoll.walrusHash = walrusHash;
        newPoll.rewardPerResponse = params.rewardPerResponse;
        newPoll.targetResponses = params.targetResponses;
        newPoll.currentResponses = 0;
        newPoll.startTime = block.timestamp;
        newPoll.endTime = block.timestamp + (params.duration * 1 days);
        newPoll.active = true;
        newPoll.optionCount = params.options.length;
        
        for (uint256 i = 0; i < params.options.length; i++) {
            newPoll.options[i] = params.options[i];
        }
        
        emit PollCreated(pollId, msg.sender, params.rewardPerResponse, walrusHash);
        
        if (msg.value > requiredPayment) {
            payable(msg.sender).transfer(msg.value - requiredPayment);
        }
    }

    function respondToPoll(uint256 _pollId, uint256 _optionIndex) external onlyVerifiedUser {
        Poll storage poll = polls[_pollId];
        require(poll.active, "Poll not active");
        require(block.timestamp <= poll.endTime, "Poll ended");
        require(poll.currentResponses < poll.targetResponses, "Target reached");
        require(!poll.hasResponded[msg.sender], "Already responded");
        require(_optionIndex < poll.optionCount, "Invalid option");
        
        uint256 userNullifier = userProfiles[msg.sender].nullifier;
        require(!poll.nullifierUsed[userNullifier], "Nullifier already used for this poll");
        
        poll.hasResponded[msg.sender] = true;
        poll.nullifierUsed[userNullifier] = true;
        poll.currentResponses++;
        poll.optionVotes[_optionIndex]++;

        userProfiles[msg.sender].totalResponses++;
        userProfiles[msg.sender].totalEarned += poll.rewardPerResponse;

        credenceToken.mint(msg.sender, poll.rewardPerResponse);
        userRewards[msg.sender] += poll.rewardPerResponse;

        string memory responseHash = string(abi.encodePacked("response_", uint2str(_pollId), "_", uint2str(block.timestamp)));
        walrusStorage.storeData(responseHash, "response");

        emit PollResponse(_pollId, msg.sender, _optionIndex, poll.rewardPerResponse, userNullifier);

        if (poll.currentResponses >= poll.targetResponses) {
            poll.active = false;
        }
    }

    function voteForWeeklyAward(address nominee, string memory reason) external onlySubscriber {
        uint256 week = block.timestamp / 1 weeks;
        require(week == currentWeek, "Can only vote for current week");
        require(userProfiles[nominee].isVerified, "Nominee must be verified");
        
        weeklyNominations[week].push(WeeklyNominationData({
            nominee: nominee,
            reason: reason,
            votes: 1,
            week: week
        }));
        
        emit WeeklyNomination(nominee, msg.sender, reason, week);
    }

    function purchaseSubscription() external payable {
        require(msg.value >= 0.1 ether, "Insufficient subscription fee");
        isSubscriber[msg.sender] = true;
        emit SubscriptionPurchased(msg.sender, msg.value);
    }

    function claimRewards() external nonReentrant {
        uint256 amount = userRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        userRewards[msg.sender] = 0;
        emit RewardClaimed(msg.sender, amount);
    }

    // View functions
    function getPoll(uint256 _pollId) external view returns (PollInfo memory) {
        Poll storage poll = polls[_pollId];
        return PollInfo({
            id: poll.id,
            creator: poll.creator,
            title: poll.title,
            description: poll.description,
            category: poll.category,
            walrusHash: poll.walrusHash,
            rewardPerResponse: poll.rewardPerResponse,
            targetResponses: poll.targetResponses,
            currentResponses: poll.currentResponses,
            startTime: poll.startTime,
            endTime: poll.endTime,
            active: poll.active
        });
    }

    function getPollOption(uint256 _pollId, uint256 _optionIndex) external view returns (string memory) {
        return polls[_pollId].options[_optionIndex];
    }

    function getPollVotes(uint256 _pollId, uint256 _optionIndex) external view returns (uint256) {
        return polls[_pollId].optionVotes[_optionIndex];
    }

    function getWeeklyNominees() external view returns (address[] memory, uint256[] memory) {
        WeeklyNominationData[] memory nominations = weeklyNominations[currentWeek];
        address[] memory nominees = new address[](nominations.length);
        uint256[] memory votes = new uint256[](nominations.length);
        
        for (uint256 i = 0; i < nominations.length; i++) {
            nominees[i] = nominations[i].nominee;
            votes[i] = nominations[i].votes;
        }
        
        return (nominees, votes);
    }

    function isUserVerified(address user) external view returns (bool) {
        return userProfiles[user].isVerified;
    }

    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 20, "Fee too high");
        platformFeePercent = _newFeePercent;
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    receive() external payable {}
}