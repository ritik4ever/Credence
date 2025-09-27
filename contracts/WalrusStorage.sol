// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract WalrusStorage is Ownable {
    struct StoredData {
        string blobId;
        address uploader;
        uint256 timestamp;
        string dataType; // "poll", "response", "competition"
        bool exists;
    }

    mapping(string => StoredData) public storedData;
    mapping(address => string[]) public userUploads;
    
    string[] public allBlobIds;
    
    event DataStored(
        string indexed blobId,
        address indexed uploader,
        string dataType,
        uint256 timestamp
    );

    function storeData(
        string memory _blobId,
        string memory _dataType
    ) external {
        require(bytes(_blobId).length > 0, "Blob ID required");
        require(!storedData[_blobId].exists, "Data already exists");
        
        storedData[_blobId] = StoredData({
            blobId: _blobId,
            uploader: msg.sender,
            timestamp: block.timestamp,
            dataType: _dataType,
            exists: true
        });
        
        userUploads[msg.sender].push(_blobId);
        allBlobIds.push(_blobId);
        
        emit DataStored(_blobId, msg.sender, _dataType, block.timestamp);
    }

    function getStoredData(string memory _blobId) 
        external 
        view 
        returns (
            string memory blobId,
            address uploader,
            uint256 timestamp,
            string memory dataType
        ) 
    {
        require(storedData[_blobId].exists, "Data does not exist");
        
        StoredData memory data = storedData[_blobId];
        return (data.blobId, data.uploader, data.timestamp, data.dataType);
    }

    function getUserUploads(address _user) external view returns (string[] memory) {
        return userUploads[_user];
    }

    function getAllBlobIds() external view returns (string[] memory) {
        return allBlobIds;
    }

    function getBlobCount() external view returns (uint256) {
        return allBlobIds.length;
    }
}