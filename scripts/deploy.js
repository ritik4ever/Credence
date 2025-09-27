const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("Starting deployment to Celo network...");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

    // Deploy Credence Token first
    console.log("\n1. Deploying Credence Token...");
    const CredenceToken = await ethers.getContractFactory("CredenceToken");
    const credenceToken = await CredenceToken.deploy(deployer.address);
    await credenceToken.deployed();
    console.log("CredenceToken deployed to:", credenceToken.address);

    // Deploy Walrus Storage
    console.log("\n2. Deploying Walrus Storage...");
    const WalrusStorage = await ethers.getContractFactory("WalrusStorage");
    const walrusStorage = await WalrusStorage.deploy();
    await walrusStorage.deployed();
    console.log("WalrusStorage deployed to:", walrusStorage.address);

    // Deploy Credence Polling
    console.log("\n3. Deploying Credence Polling...");
    const hubV2Address = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74"; // Celo Testnet Hub
    const scopeSeed = "credence-polls";
    const verificationConfigId = "0x0000000000000000000000000000000000000000000000000000000000000001"; // Placeholder

    const CredencePolling = await ethers.getContractFactory("CredencePolling");
    const credencePolling = await CredencePolling.deploy(
        hubV2Address,
        scopeSeed,
        credenceToken.address,
        verificationConfigId
    );
    await credencePolling.deployed();
    console.log("CredencePolling deployed to:", credencePolling.address);

    // Grant minter role to polling contract
    console.log("\n4. Setting up permissions...");
    const MINTER_ROLE = await credenceToken.MINTER_ROLE();
    await credenceToken.grantRole(MINTER_ROLE, credencePolling.address);
    console.log("Granted MINTER_ROLE to CredencePolling contract");

    // Verify contracts on Celo Explorer
    console.log("\n5. Verifying contracts...");
    try {
        await hre.run("verify:verify", {
            address: credenceToken.address,
            constructorArguments: [deployer.address],
        });
        console.log("CredenceToken verified");

        await hre.run("verify:verify", {
            address: walrusStorage.address,
            constructorArguments: [],
        });
        console.log("WalrusStorage verified");

        await hre.run("verify:verify", {
            address: credencePolling.address,
            constructorArguments: [
                hubV2Address,
                scopeSeed,
                credenceToken.address,
                verificationConfigId
            ],
        });
        console.log("CredencePolling verified");
    } catch (error) {
        console.log("Verification failed:", error.message);
    }

    // Create deployment summary
    const deploymentInfo = {
        network: hre.network.name,
        deployer: deployer.address,
        contracts: {
            CredenceToken: credenceToken.address,
            WalrusStorage: walrusStorage.address,
            CredencePolling: credencePolling.address
        },
        timestamp: new Date().toISOString(),
        hubV2Address,
        scopeSeed,
        verificationConfigId
    };

    console.log("\n=== DEPLOYMENT COMPLETE ===");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Save deployment info to file
    const fs = require('fs');
    fs.writeFileSync(
        `deployments/${hre.network.name}.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`\nDeployment info saved to deployments/${hre.network.name}.json`);
    console.log("\nNext steps:");
    console.log("1. Update frontend .env with contract addresses");
    console.log("2. Set up Self Protocol verification config");
    console.log("3. Fund polling contract for gas fees");
    console.log("4. Test poll creation and verification flow");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });