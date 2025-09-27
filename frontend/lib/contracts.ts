import { ethers } from 'ethers'

const CREDENCE_ABI = [
    "function createPoll(string title, string description, string category, string walrusHash, uint256 rewardPerResponse, uint256 targetResponses, uint256 duration) external payable",
    "function getPoll(uint256 pollId) external view returns (uint256, address, string, string, string, string, uint256, uint256, uint256, uint256, uint256, bool)",
    "function respondToPollWithVerification(uint256 pollId, string responseHash, bytes proof, uint256[] publicSignals, bytes userContextData) external",
    "function userRewards(address user) external view returns (uint256)",
    "function claimRewards() external",
    "function nextPollId() external view returns (uint256)"
]

export class ContractService {
    private provider: ethers.BrowserProvider | null = null
    private signer: ethers.Signer | null = null
    private credenceContract: ethers.Contract | null = null

    async initialize(walletClient: any) {
        this.provider = new ethers.BrowserProvider(walletClient)
        this.signer = await this.provider.getSigner()

        const credenceAddress = process.env.NEXT_PUBLIC_CREDENCE_CONTRACT

        if (credenceAddress) {
            this.credenceContract = new ethers.Contract(credenceAddress, CREDENCE_ABI, this.signer)
        }
    }

    async createPoll(pollData: {
        title: string
        description: string
        category: string
        options: string[]
        rewardPerResponse: number
        targetResponses: number
        duration: number
    }) {
        if (!this.credenceContract) throw new Error('Contract not initialized')

        // Mock Walrus hash
        const walrusHash = 'mock_hash_' + Date.now()

        const totalReward = pollData.rewardPerResponse * pollData.targetResponses
        const platformFee = Math.floor(totalReward * 0.1)
        const totalPayment = totalReward + platformFee

        const tx = await this.credenceContract.createPoll(
            pollData.title,
            pollData.description,
            pollData.category,
            walrusHash,
            ethers.parseEther(pollData.rewardPerResponse.toString()),
            pollData.targetResponses,
            pollData.duration * 24 * 60 * 60,
            { value: ethers.parseEther(totalPayment.toString()) }
        )

        return await tx.wait()
    }

    async getPoll(pollId: number) {
        if (!this.credenceContract) throw new Error('Contract not initialized')

        try {
            const result = await this.credenceContract.getPoll(pollId)

            return {
                id: pollId,
                creator: result[1],
                title: result[2],
                description: result[3],
                category: result[4],
                walrusHash: result[5],
                rewardPerResponse: ethers.formatEther(result[6]),
                targetResponses: Number(result[7]),
                currentResponses: Number(result[8]),
                startTime: new Date(Number(result[9]) * 1000),
                endTime: new Date(Number(result[10]) * 1000),
                active: result[11],
                options: ['Option 1', 'Option 2', 'Option 3'], // Mock options
                votes: [50, 30, 20] // Mock votes
            }
        } catch (error) {
            return null
        }
    }

    async getAllPolls() {
        const polls = []

        // Mock polls data if contract not available
        if (!this.credenceContract) {
            return [
                {
                    id: 1,
                    title: 'Remote Work Preferences',
                    description: 'Help us understand modern work preferences',
                    category: 'Technology',
                    options: ['Home office', 'Co-working space', 'Coffee shop'],
                    votes: [150, 80, 45],
                    rewardPerResponse: '15',
                    targetResponses: 100,
                    currentResponses: 75,
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    active: true
                }
            ]
        }

        try {
            const nextId = await this.credenceContract.nextPollId()

            for (let i = 1; i < Number(nextId); i++) {
                const poll = await this.getPoll(i)
                if (poll) polls.push(poll)
            }

            return polls
        } catch (error) {
            console.error('Failed to get polls:', error)
            return []
        }
    }

    async respondToPoll(pollId: number, optionIndex: number, verificationData: any) {
        if (!this.credenceContract) throw new Error('Contract not initialized')

        const responseHash = ethers.keccak256(ethers.toUtf8Bytes(`${pollId}-${optionIndex}-${Date.now()}`))

        const tx = await this.credenceContract.respondToPollWithVerification(
            pollId,
            responseHash,
            verificationData.proof || '0x',
            verificationData.publicSignals || [],
            verificationData.userContextData || '0x'
        )

        return await tx.wait()
    }

    async getUserRewards(address: string) {
        if (!this.credenceContract) return '0'

        try {
            const rewards = await this.credenceContract.userRewards(address)
            return ethers.formatEther(rewards)
        } catch (error) {
            return '0'
        }
    }

    async getTokenBalance(address: string) {
        // Mock token balance
        return '45'
    }

    async claimRewards() {
        if (!this.credenceContract) throw new Error('Contract not initialized')

        const tx = await this.credenceContract.claimRewards()
        return await tx.wait()
    }
}

export const contractService = new ContractService()