// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CredenceToken.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address walletAddress = vm.envAddress("WALLET_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        CredenceToken token = new CredenceToken(walletAddress);
        
        vm.stopBroadcast();
        
        console.log("CredenceToken deployed to:", address(token));
    }
}