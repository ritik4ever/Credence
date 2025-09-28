// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract TestOZ is Ownable {
    // FIXED: Pass msg.sender as initialOwner to Ownable constructor
    constructor() Ownable(msg.sender) {}
    
    // Example function to test ownership
    function testOwnerOnly() external onlyOwner returns (string memory) {
        return "Only owner can call this function";
    }
}