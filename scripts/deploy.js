const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log(`Starting deployment to ${hre.network.name} network...`);
    console.log(`Chain ID: ${hre.network.config.chainId}`);

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));

    // Check if we have enough balance for deployment
    const balance = await deployer.getBalance();
    if (balance.lt(ethers.utils.parseEther("0.1"))) {
        console.warn("⚠️  Low balance! Make sure you have enough CELO for deployment.");
    }

    // Deploy Credence Token
    console.log("\n1. Deploying Credence Token...");
    const CredenceToken = await ethers.getContractFactory("CredenceToken");
    const credenceToken = await CredenceToken.deploy(deployer.address);
    await credenceToken.deployed();
    console.log("✅ CredenceToken deployed to:", credenceToken.address);

    // Deploy Walrus Storage
    console.log("\n2. Deploying Walrus Storage...");
    const WalrusStorage = await ethers.getContractFactory("WalrusStorage");
    const walrusStorage = await WalrusStorage.deploy();
    await walrusStorage.deployed();
    console.log("✅ WalrusStorage deployed to:", walrusStorage.address);

    // For Celo Sepolia, use a mock Self hub address (you can update this later)
    const selfHubAddress = process.env.SELF_HUB_ADDRESS || deployer.address;

    // Deploy Credence Polling
    console.log("\n3. Deploying Credence Polling...");
    const CredencePolling = await ethers.getContractFactory("CredencePolling");
    const credencePolling = await CredencePolling.deploy(
        selfHubAddress,
        credenceToken.address
    );
    await credencePolling.deployed();
    console.log("✅ CredencePolling deployed to:", credencePolling.address);

    // Grant minter role
    console.log("\n4. Setting up permissions...");
    const MINTER_ROLE = await credenceToken.MINTER_ROLE();
    const tx = await credenceToken.grantRole(MINTER_ROLE, credencePolling.address);
    await tx.wait();
    console.log("✅ Granted MINTER_ROLE to CredencePolling contract");

    // Create deployment info
    const deploymentInfo = {
        network: hre.network.name,
        chainId: hre.network.config.chainId,
        deployer: deployer.address,
        contracts: {
            CredenceToken: credenceToken.address,
            WalrusStorage: walrusStorage.address,
            CredencePolling: credencePolling.address
        },
        selfHubAddress: selfHubAddress,
        timestamp: new Date().toISOString(),
        blockExplorers: {
            "celo-sepolia": "https://celo-sepolia.blockscout.com",
            "alfajores": "https://alfajores.celoscan.io",
            "celo": "https://celoscan.io"
        }
    };

    console.log("\n🎉 === DEPLOYMENT COMPLETE ===");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Save to file
    const fs = require('fs');
    const deployDir = 'deployments';
    if (!fs.existsSync(deployDir)) {
        fs.mkdirSync(deployDir);
    }

    fs.writeFileSync(
        `${deployDir}/${hre.network.name}.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`\n📄 Deployment info saved to deployments/${hre.network.name}.json`);

    // Get the correct explorer URL
    const explorerUrl = deploymentInfo.blockExplorers[hre.network.name];

    console.log("\n🔗 Contract Addresses:");
    console.log(`Token: ${explorerUrl}/address/${credenceToken.address}`);
    console.log(`Polling: ${explorerUrl}/address/${credencePolling.address}`);
    console.log(`Storage: ${explorerUrl}/address/${walrusStorage.address}`);

    console.log("\n📝 Update your frontend .env with:");
    console.log(`NEXT_PUBLIC_CREDENCE_CONTRACT=${credencePolling.address}`);
    console.log(`NEXT_PUBLIC_TOKEN_CONTRACT=${credenceToken.address}`);
    console.log(`NEXT_PUBLIC_CHAIN_ID=${hre.network.config.chainId}`);

    if (hre.network.name !== "hardhat") {
        console.log("\n⏳ Waiting 30 seconds before verification...");
        await new Promise(resolve => setTimeout(resolve, 30000));

        try {
            console.log("\n🔍 Verifying contracts...");
            await hre.run("verify:verify", {
                address: credenceToken.address,
                constructorArguments: [deployer.address],
            });
            console.log("✅ CredenceToken verified");

            await hre.run("verify:verify", {
                address: walrusStorage.address,
                constructorArguments: [],
            });
            console.log("✅ WalrusStorage verified");

            await hre.run("verify:verify", {
                address: credencePolling.address,
                constructorArguments: [selfHubAddress, credenceToken.address],
            });
            console.log("✅ CredencePolling verified");
        } catch (error) {
            console.log("⚠️  Verification failed:", error.message);
            console.log("You can verify manually later using the contract addresses above");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });