// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract WalrusStorage is Ownable, ReentrancyGuard {
    struct StoredData {
        string blobId;
        address uploader;
        uint256 timestamp;
        string dataType; // "poll", "response", "competition", "nomination"
        bool exists;
        uint256 pollId; // Link to poll if applicable
        string metadataHash; // Additional metadata hash
    }

    mapping(string => StoredData) public storedData;
    mapping(address => string[]) public userUploads;
    mapping(uint256 => string[]) public pollData; // pollId => blobIds
    mapping(string => string[]) public dataByType; // dataType => blobIds
    
    string[] public allBlobIds;
    
    // Weekly competition data storage
    mapping(uint256 => string[]) public weeklyCompetitionData;
    
    event DataStored(
        string indexed blobId,
        address indexed uploader,
        string dataType,
        uint256 timestamp,
        uint256 pollId
    );
    
    event MetadataUpdated(
        string indexed blobId,
        string metadataHash
    );

    // FIXED: Pass msg.sender as initialOwner to Ownable constructor
    constructor() Ownable(msg.sender) {}

    function storeData(
        string memory _blobId,
        string memory _dataType
    ) external {
        _storeDataWithPoll(_blobId, _dataType, 0, "");
    }

    function storeDataWithPoll(
        string memory _blobId,
        string memory _dataType,
        uint256 _pollId
    ) external {
        _storeDataWithPoll(_blobId, _dataType, _pollId, "");
    }

    function storeDataWithMetadata(
        string memory _blobId,
        string memory _dataType,
        uint256 _pollId,
        string memory _metadataHash
    ) external {
        _storeDataWithPoll(_blobId, _dataType, _pollId, _metadataHash);
    }

    function _storeDataWithPoll(
        string memory _blobId,
        string memory _dataType,
        uint256 _pollId,
        string memory _metadataHash
    ) internal {
        require(bytes(_blobId).length > 0, "Blob ID required");
        require(!storedData[_blobId].exists, "Data already exists");
        
        storedData[_blobId] = StoredData({
            blobId: _blobId,
            uploader: msg.sender,
            timestamp: block.timestamp,
            dataType: _dataType,
            exists: true,
            pollId: _pollId,
            metadataHash: _metadataHash
        });
        
        userUploads[msg.sender].push(_blobId);
        allBlobIds.push(_blobId);
        dataByType[_dataType].push(_blobId);
        
        if (_pollId > 0) {
            pollData[_pollId].push(_blobId);
        }
        
        // Store weekly competition data
        if (keccak256(bytes(_dataType)) == keccak256(bytes("competition"))) {
            uint256 week = block.timestamp / 1 weeks;
            weeklyCompetitionData[week].push(_blobId);
        }
        
        emit DataStored(_blobId, msg.sender, _dataType, block.timestamp, _pollId);
        
        if (bytes(_metadataHash).length > 0) {
            emit MetadataUpdated(_blobId, _metadataHash);
        }
    }

    function getStoredData(string memory _blobId) 
        external 
        view 
        returns (
            string memory blobId,
            address uploader,
            uint256 timestamp,
            string memory dataType,
            uint256 pollId,
            string memory metadataHash
        ) 
    {
        require(storedData[_blobId].exists, "Data does not exist");
        
        StoredData memory data = storedData[_blobId];
        return (
            data.blobId, 
            data.uploader, 
            data.timestamp, 
            data.dataType,
            data.pollId,
            data.metadataHash
        );
    }

    function getUserUploads(address _user) external view returns (string[] memory) {
        return userUploads[_user];
    }

    function getPollData(uint256 _pollId) external view returns (string[] memory) {
        return pollData[_pollId];
    }

    function getDataByType(string memory _dataType) external view returns (string[] memory) {
        return dataByType[_dataType];
    }

    function getWeeklyCompetitionData(uint256 _week) external view returns (string[] memory) {
        return weeklyCompetitionData[_week];
    }

    function getAllBlobIds() external view returns (string[] memory) {
        return allBlobIds;
    }

    function getBlobCount() external view returns (uint256) {
        return allBlobIds.length;
    }

    function getBlobCountByType(string memory _dataType) external view returns (uint256) {
        return dataByType[_dataType].length;
    }

    // Admin functions for data management
    function removeData(string memory _blobId) external onlyOwner {
        require(storedData[_blobId].exists, "Data does not exist");
        delete storedData[_blobId];
    }

    function updateMetadata(string memory _blobId, string memory _metadataHash) external {
        require(storedData[_blobId].exists, "Data does not exist");
        require(storedData[_blobId].uploader == msg.sender || owner() == msg.sender, "Unauthorized");
        
        storedData[_blobId].metadataHash = _metadataHash;
        emit MetadataUpdated(_blobId, _metadataHash);
    }

    // Batch operations for efficiency
    function batchStoreData(
        string[] memory _blobIds,
        string[] memory _dataTypes,
        uint256[] memory _pollIds
    ) external {
        require(_blobIds.length == _dataTypes.length, "Array length mismatch");
        require(_blobIds.length == _pollIds.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _blobIds.length; i++) {
            _storeDataWithPoll(_blobIds[i], _dataTypes[i], _pollIds[i], "");
        }
    }
}