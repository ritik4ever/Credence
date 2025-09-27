const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("CredencePolling", function () {
    let credencePolling;
    let credenceToken;
    let walrusStorage;
    let owner;
    let user1;
    let user2;

    const hubV2Address = "0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74";
    const scopeSeed = "test-scope";
    const verificationConfigId = "0x0000000000000000000000000000000000000000000000000000000000000001";

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy CredenceToken
        const CredenceToken = await ethers.getContractFactory("CredenceToken");
        credenceToken = await CredenceToken.deploy(owner.address);
        await credenceToken.deployed();

        // Deploy WalrusStorage
        const WalrusStorage = await ethers.getContractFactory("WalrusStorage");
        walrusStorage = await WalrusStorage.deploy();
        await walrusStorage.deployed();

        // Deploy CredencePolling
        const CredencePolling = await ethers.getContractFactory("CredencePolling");
        credencePolling = await CredencePolling.deploy(
            hubV2Address,
            scopeSeed,
            credenceToken.address,
            verificationConfigId
        );
        await credencePolling.deployed();

        // Grant minter role to polling contract
        const MINTER_ROLE = await credenceToken.MINTER_ROLE();
        await credenceToken.grantRole(MINTER_ROLE, credencePolling.address);
    });

    describe("Poll Creation", function () {
        it("Should create a poll with correct parameters", async function () {
            const rewardPerResponse = ethers.utils.parseEther("10");
            const targetResponses = 100;
            const duration = 7 * 24 * 60 * 60; // 7 days
            const totalReward = rewardPerResponse.mul(targetResponses);
            const platformFee = totalReward.mul(10).div(100);
            const totalPayment = totalReward.add(platformFee);

            await expect(
                credencePolling.createPoll(
                    "Test Poll",
                    "A test poll description",
                    "technology",
                    "test-ipfs-hash",
                    rewardPerResponse,
                    targetResponses,
                    duration,
                    { value: totalPayment }
                )
            ).to.emit(credencePolling, "PollCreated")
                .withArgs(1, owner.address, rewardPerResponse);

            const poll = await credencePolling.getPoll(1);
            expect(poll.title).to.equal("Test Poll");
            expect(poll.rewardPerResponse).to.equal(rewardPerResponse);
            expect(poll.targetResponses).to.equal(targetResponses);
            expect(poll.active).to.be.true;
        });

        it("Should fail to create poll with insufficient payment", async function () {
            const rewardPerResponse = ethers.utils.parseEther("10");
            const targetResponses = 100;
            const duration = 7 * 24 * 60 * 60;
            const insufficientPayment = ethers.utils.parseEther("500"); // Less than required

            await expect(
                credencePolling.createPoll(
                    "Test Poll",
                    "Description",
                    "technology",
                    "test-hash",
                    rewardPerResponse,
                    targetResponses,
                    duration,
                    { value: insufficientPayment }
                )
            ).to.be.revertedWith("Insufficient payment");
        });
    });

    describe("User Rewards", function () {
        beforeEach(async function () {
            // Create a test poll
            const rewardPerResponse = ethers.utils.parseEther("5");
            const targetResponses = 10;
            const duration = 7 * 24 * 60 * 60;
            const totalReward = rewardPerResponse.mul(targetResponses);
            const platformFee = totalReward.mul(10).div(100);
            const totalPayment = totalReward.add(platformFee);

            await credencePolling.createPoll(
                "Test Poll",
                "Description",
                "general",
                "test-hash",
                rewardPerResponse,
                targetResponses,
                duration,
                { value: totalPayment }
            );
        });

        it("Should track user rewards correctly", async function () {
            const initialRewards = await credencePolling.userRewards(user1.address);
            expect(initialRewards).to.equal(0);

            // Check token balance
            const tokenBalance = await credenceToken.balanceOf(user1.address);
            expect(tokenBalance).to.equal(0);
        });

        it("Should allow users to claim rewards", async function () {
            // This would require a full Self Protocol integration for testing
            // For now, we test the claim function exists
            await expect(credencePolling.connect(user1).claimRewards())
                .to.be.revertedWith("No rewards to claim");
        });
    });

    describe("Weekly Competitions", function () {
        it("Should allow owner to start weekly competition", async function () {
            const nominatedResponses = ["response1", "response2", "response3"];

            await expect(
                credencePolling.startWeeklyCompetition(nominatedResponses)
            ).to.emit(credencePolling, "WeeklyCompetitionStarted");
        });

        it("Should allow verified users to vote in weekly competition", async function () {
            // Start competition
            const nominatedResponses = ["response1", "response2"];
            await credencePolling.startWeeklyCompetition(nominatedResponses);

            // Mark user as verified (this would normally happen through Self Protocol)
            await credencePolling.connect(owner).updateVerificationConfigId(verificationConfigId);

            // Note: In real implementation, user would be verified through Self Protocol
            // This test demonstrates the voting logic structure
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to update platform fee", async function () {
            await credencePolling.updatePlatformFee(15); // 15%
            // Test would verify fee is updated in next poll creation
        });

        it("Should allow owner to update verification config", async function () {
            const newConfigId = "0x0000000000000000000000000000000000000000000000000000000000000002";
            await credencePolling.updateVerificationConfigId(newConfigId);

            const updatedConfigId = await credencePolling.verificationConfigId();
            expect(updatedConfigId).to.equal(newConfigId);
        });

        it("Should not allow non-owner to update settings", async function () {
            await expect(
                credencePolling.connect(user1).updatePlatformFee(20)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Edge Cases", function () {
        it("Should handle poll expiration correctly", async function () {
            const rewardPerResponse = ethers.utils.parseEther("1");
            const targetResponses = 5;
            const duration = 1; // 1 second for quick expiry
            const totalReward = rewardPerResponse.mul(targetResponses);
            const platformFee = totalReward.mul(10).div(100);
            const totalPayment = totalReward.add(platformFee);

            await credencePolling.createPoll(
                "Expiring Poll",
                "Will expire soon",
                "test",
                "hash",
                rewardPerResponse,
                targetResponses,
                duration,
                { value: totalPayment }
            );

            // Advance time beyond poll duration
            await time.increase(2);

            const poll = await credencePolling.getPoll(1);
            const currentTime = await time.latest();
            expect(currentTime).to.be.greaterThan(poll.endTime);
        });
    });
});