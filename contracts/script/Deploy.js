const { ethers } = require("ethers");

async function deploy() {
    // 1. Deploy CredenceToken
    const CredenceToken = await ethers.getContractFactory("CredenceToken");
    const credenceToken = await CredenceToken.deploy(deployer.address);
    console.log("CredenceToken deployed to:", credenceToken.address);

    // 2. Deploy WalrusStorage
    const WalrusStorage = await ethers.getContractFactory("WalrusStorage");
    const walrusStorage = await WalrusStorage.deploy();
    console.log("WalrusStorage deployed to:", walrusStorage.address);

    // 3. Deploy CredencePolling
    const CredencePolling = await ethers.getContractFactory("CredencePolling");
    const credencePolling = await CredencePolling.deploy(
        "0x68c931C9a534D37aa78094877F46fE46a49F1A51", // Celo testnet hub
        "credence-polls", // scope seed
        credenceToken.address,
        walrusStorage.address
    );
    console.log("CredencePolling deployed to:", credencePolling.address);

    // 4. Grant minter role to polling contract
    await credenceToken.grantMinterRole(credencePolling.address);
    console.log("Minter role granted to CredencePolling");

    // 5. Optional: Deploy Governance
    const CredenceGovernance = await ethers.getContractFactory("CredenceGovernance");
    const governance = await CredenceGovernance.deploy(credenceToken.address);
    console.log("CredenceGovernance deployed to:", governance.address);
}