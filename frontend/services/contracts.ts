import { ethers } from 'ethers'
import { useAccount, useNetwork, useSigner } from 'wagmi'

const CREDENCE_POLLING_ABI = [
    "function createPoll(string title, string description, string category, string ipfsHash, uint256 rewardPerResponse, uint256 targetResponses, uint256 duration) external payable",
    "function getPoll(uint256 pollId) external view returns (uint256, address, string, string, string, string, uint256, uint256, uint256, uint256, uint256, bool)",
    "function verifySelfProof(bytes proofPayload, bytes userContextData) external",
    "function hasUserResponded(uint256 pollId, uint256 nullifier) external view returns (bool)",
    "function userRewards(address user) external view returns (uint256)",
    "function claimRewards() external",
    "function voteInWeeklyCompetition(uint256 weekId, string responseHash) external",
    "event PollCreated(uint256 indexed pollId, address indexed creator, uint256 reward)",
    "event PollResponse(uint256 indexed pollId, uint256 nullifier, uint256 reward)",
    "event UserVerified(address indexed user, uint256 nullifier)",
    "event WeeklyVote(uint256 indexed weekId, string responseHash, address voter)"
]

const CREDENCE_TOKEN_ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)"
]

class ContractService {
    private pollingContract: ethers.Contract | null = null
    private tokenContract: ethers.Contract | null = null
    private signer: ethers.Signer | null = null

    async initialize(signer: ethers.Signer) {
        this.signer = signer

        const pollingAddress = process.env.NEXT_PUBLIC_CREDENCE_CONTRACT
        const tokenAddress = process.env.NEXT_PUBLIC_TOKEN_CONTRACT

        if (pollingAddress && tokenAddress) {
            this.pollingContract = new ethers.Contract(pollingAddress, CREDENCE_POLLING_ABI, signer)
            this.tokenContract = new ethers.Contract(tokenAddress, CREDENCE_TOKEN_ABI, signer)
        }
    }

    async createPoll(pollData: {
        title: string
        description: string
        category: string
        ipfsHash: string
        rewardPerResponse: number
        targetResponses: number
        duration: number
        totalPayment: string
    }) {
        if (!this.pollingContract) throw new Error('Contract not initialized')

        const tx = await this.pollingContract.createPoll(
            pollData.title,
            pollData.description,
            pollData.category,
            pollData.ipfsHash,
            ethers.utils.parseEther(pollData.rewardPerResponse.toString()),
            pollData.targetResponses,
            pollData.duration,
            { value: ethers.utils.parseEther(pollData.totalPayment) }
        )

        return await tx.wait()
    }

    async getPoll(pollId: number) {
        if (!this.pollingContract) throw new Error('Contract not initialized')

        const result = await this.pollingContract.getPoll(pollId)
        return {
            id: result[0].toNumber(),
            creator: result[1],
            title: result[2],
            description: result[3],
            category: result[4],
            ipfsHash: result[5],
            rewardPerResponse: ethers.utils.formatEther(result[6]),
            targetResponses: result[7].toNumber(),
            currentResponses: result[8].toNumber(),
            startTime: new Date(result[9].toNumber() * 1000),
            endTime: new Date(result[10].toNumber() * 1000),
            active: result[11]
        }
    }

    async submitPollResponse(proofPayload: string, userContextData: string) {
        if (!this.pollingContract) throw new Error('Contract not initialized')

        const tx = await this.pollingContract.verifySelfProof(
            proofPayload,
            userContextData
        )

        return await tx.wait()
    }

    async getUserRewards(userAddress: string): Promise<string> {
        if (!this.pollingContract) throw new Error('Contract not initialized')

        const rewards = await this.pollingContract.userRewards(userAddress)
        return ethers.utils.formatEther(rewards)
    }

    async claimRewards() {
        if (!this.pollingContract) throw new Error('Contract not initialized')

        const tx = await this.pollingContract.claimRewards()
        return await tx.wait()
    }

    async getTokenBalance(userAddress: string): Promise<string> {
        if (!this.tokenContract) throw new Error('Token contract not initialized')

        const balance = await this.tokenContract.balanceOf(userAddress)
        return ethers.utils.formatEther(balance)
    }

    async voteInWeeklyCompetition(weekId: number, responseHash: string) {
        if (!this.pollingContract) throw new Error('Contract not initialized')

        const tx = await this.pollingContract.voteInWeeklyCompetition(weekId, responseHash)
        return await tx.wait()
    }
}

export const contractService = new ContractService()

// Hook for easy contract usage
export function useContracts() {
    const { data: signer } = useSigner()
    const { address } = useAccount()

    const initializeContracts = async () => {
        if (signer) {
            await contractService.initialize(signer)
        }
    }

    return {
        contractService,
        initializeContracts,
        isReady: !!signer
    }
}