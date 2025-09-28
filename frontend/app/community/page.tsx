import { ethers } from 'ethers'

// Configuration constants - Updated for new contract
const SELF_CONFIG_ID = process.env.NEXT_PUBLIC_SELF_CONFIG_ID || "0x7b6436b0c98f62380866d9432c2af0ee08ce16a171bda6951aecd95ee1307d61"
const SELF_SCOPE_DECIMAL = process.env.NEXT_PUBLIC_SELF_SCOPE_DECIMAL || "128"
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CREDENCE_POLLING_ADDRESS || "0x7EAF94846A0a721D5faab51b8db4210B3c0dcf42"

// Complete ABI for your deployed contracts
const CREDENCE_ABI = [
    "function scope() external view returns (uint256)",
    "function nextPollId() external view returns (uint256)",
    "function isUserVerified(address user) external view returns (bool)",
    "function isSubscriber(address user) external view returns (bool)",
    "function createPoll((string title, string description, string category, string[] options, uint256 rewardPerResponse, uint256 targetResponses, uint256 duration) params) external payable",
    "function getPoll(uint256 pollId) external view returns ((uint256 id, address creator, string title, string description, string category, string walrusHash, uint256 rewardPerResponse, uint256 targetResponses, uint256 currentResponses, uint256 startTime, uint256 endTime, bool active))",
    "function getPollOption(uint256 pollId, uint256 optionIndex) external view returns (string)",
    "function getPollVotes(uint256 pollId, uint256 optionIndex) external view returns (uint256)",
    "function respondToPoll(uint256 pollId, uint256 optionIndex) external",
    "function verifySelfProof(bytes proofPayload, bytes userContextData) external",
    "function userRewards(address user) external view returns (uint256)",
    "function userProfiles(address user) external view returns (bool isVerified, uint256 verifiedAt, uint256 totalResponses, uint256 totalEarned, uint256 nullifier)",
    "function claimRewards() external",
    "function purchaseSubscription() external payable",
    "function voteForWeeklyAward(address nominee, string reason) external",
    "function getWeeklyNominees() external view returns (address[], uint256[])",
    "function verificationConfigId() external view returns (bytes32)",
    "function setStrictVerificationConfig() external",
    "function platformFeePercent() external view returns (uint256)"
] as const

const TOKEN_ABI = [
    "function balanceOf(address owner) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function totalSupply() external view returns (uint256)",
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)"
] as const

// TypeScript interfaces
export interface Poll {
    id: number
    creator: string
    title: string
    description: string
    category: string
    walrusHash: string
    rewardPerResponse: string
    targetResponses: number
    currentResponses: number
    startTime: Date
    endTime: Date
    active: boolean
    options: string[]
    votes: number[]
}

export interface UserProfile {
    isVerified: boolean
    verifiedAt: Date | null
    totalResponses: number
    totalEarned: string
    nullifier: string
}

export interface CreatePollParams {
    title: string
    description: string
    category: string
    options: string[]
    rewardPerResponse: number
    targetResponses: number
    duration: number
}

export interface TokenInfo {
    name: string
    symbol: string
    decimals: number
    totalSupply: string
    userBalance: string
}

export class ContractService {
    private provider: ethers.BrowserProvider | null = null
    private signer: ethers.Signer | null = null
    private credenceContract: ethers.Contract | null = null
    private tokenContract: ethers.Contract | null = null
    private userAddress: string | null = null
    private contractScope: string = SELF_SCOPE_DECIMAL

    // Contract addresses - Updated for new deployment
    private readonly contractAddress = CONTRACT_ADDRESS
    private readonly tokenAddress = "0xc1da3dfb0f84756bbd346d4ae82abfec17555c83"
    private readonly chainId = 11142220 // Celo Sepolia
    private readonly rpcUrl = "https://celo-sepolia.drpc.org"

    async initialize(walletClient?: unknown): Promise<void> {
        if (typeof window === 'undefined' || !window.ethereum) {
            throw new Error('Please install MetaMask or another Ethereum wallet')
        }

        try {
            console.log('Starting contract service initialization...')

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' })

            this.provider = new ethers.BrowserProvider(window.ethereum)
            this.signer = await this.provider.getSigner()
            this.userAddress = await this.signer.getAddress()

            // Switch to Celo Sepolia if needed
            await this.ensureCorrectNetwork()

            // Initialize contracts
            this.credenceContract = new ethers.Contract(this.contractAddress, CREDENCE_ABI, this.signer)
            this.tokenContract = new ethers.Contract(this.tokenAddress, TOKEN_ABI, this.signer)

            console.log('✅ Contract service initialized successfully')
            console.log('User address:', this.userAddress)
            console.log('Contract address:', this.contractAddress)
            console.log('Using Config ID:', SELF_CONFIG_ID)
            console.log('Using Scope:', this.contractScope)

        } catch (error) {
            console.error('❌ Contract initialization failed:', error)
            throw error
        }
    }

    private async ensureCorrectNetwork(): Promise<void> {
        if (!this.provider) return

        const network = await this.provider.getNetwork()
        const currentChainId = Number(network.chainId)

        if (currentChainId !== this.chainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${this.chainId.toString(16)}` }],
                })
            } catch (switchError: any) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${this.chainId.toString(16)}`,
                            chainName: 'Celo Sepolia Testnet',
                            nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
                            rpcUrls: [this.rpcUrl],
                            blockExplorerUrls: ['https://celo-sepolia.blockscout.com'],
                        }],
                    })
                } else {
                    throw switchError
                }
            }
        }
    }

    // Self Protocol Integration
    generateSelfVerificationURL(userAddress?: string): string {
        const address = userAddress || this.userAddress
        if (!address) {
            throw new Error('User address not available. Please connect wallet first.')
        }

        const verificationData = {
            contractAddress: this.contractAddress,
            userAddress: address,
            configId: SELF_CONFIG_ID,
            scope: this.contractScope
        }

        console.log('=== SELF PROTOCOL VERIFICATION DEBUG ===')
        console.log('Contract Address:', this.contractAddress)
        console.log('Config ID:', SELF_CONFIG_ID)
        console.log('Scope:', this.contractScope)
        console.log('User Address:', address)

        const params = new URLSearchParams()
        Object.entries(verificationData).forEach(([key, value]) => {
            params.append(key, value.toString())
        })

        const url = `https://verify.self.id/?${params.toString()}`
        console.log('Generated URL:', url)
        console.log('=== END DEBUG ===')

        return url
    }

    async verifyUserIdentity(proofData: any): Promise<any> {
        if (!this.credenceContract) throw new Error('Contract not initialized')

        console.log('Verifying user identity with proof data:', proofData)

        try {
            const proofPayload = ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify(proofData)))
            const userContextData = ethers.hexlify(ethers.toUtf8Bytes(JSON.stringify({
                timestamp: Date.now(),
                platform: 'credence',
                version: '1.0'
            })))

            const tx = await this.credenceContract.verifySelfProof(proofPayload, userContextData, {
                gasLimit: 500000
            })

            console.log('Verification transaction sent:', tx.hash)
            const receipt = await tx.wait()
            console.log('Verification transaction confirmed:', receipt)

            return receipt
        } catch (error) {
            console.error('Error during verification:', error)
            throw error
        }
    }

    // User Profile & Verification
    async isUserVerified(address?: string): Promise<boolean> {
        if (!this.credenceContract) return false

        const checkAddress = address || this.userAddress
        if (!checkAddress) return false

        try {
            return await this.credenceContract.isUserVerified(checkAddress)
        } catch (error) {
            console.error('Error checking verification status:', error)
            return false
        }
    }

    async getUserProfile(address?: string): Promise<UserProfile | null> {
        if (!this.credenceContract) return null

        const checkAddress = address || this.userAddress
        if (!checkAddress) return null

        try {
            const profile = await this.credenceContract.userProfiles(checkAddress)
            return {
                isVerified: profile.isVerified,
                verifiedAt: profile.verifiedAt > 0 ? new Date(Number(profile.verifiedAt) * 1000) : null,
                totalResponses: Number(profile.totalResponses),
                totalEarned: ethers.formatEther(profile.totalEarned),
                nullifier: profile.nullifier.toString()
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
            return null
        }
    }

    // Subscription Management
    async getSubscriptionStatus(address?: string): Promise<boolean> {
        if (!this.credenceContract) return false

        const checkAddress = address || this.userAddress
        if (!checkAddress) return false

        try {
            return await this.credenceContract.isSubscriber(checkAddress)
        } catch (error) {
            console.error('Error checking subscription status:', error)
            return false
        }
    }

    async purchaseSubscription(): Promise<any> {
        if (!this.credenceContract) throw new Error('Contract not initialized')

        const subscriptionFee = ethers.parseEther("0.1")
        const tx = await this.credenceContract.purchaseSubscription({
            value: subscriptionFee,
            gasLimit: 100000
        })
        return await tx.wait()
    }

    // Token Operations
    async getTokenBalance(address?: string): Promise<string> {
        return this.getUserRewards(address)
    }

    async getUserRewards(address?: string): Promise<string> {
        if (!this.credenceContract) return '0'

        const checkAddress = address || this.userAddress
        if (!checkAddress) return '0'

        try {
            const rewards = await this.credenceContract.userRewards(checkAddress)
            return ethers.formatEther(rewards)
        } catch (error) {
            console.error('Error fetching user rewards:', error)
            return '0'
        }
    }

    async claimRewards(): Promise<any> {
        if (!this.credenceContract) throw new Error('Contract not initialized')

        const tx = await this.credenceContract.claimRewards({
            gasLimit: 150000
        })
        return await tx.wait()
    }

    // Poll Management
    async createPoll(pollData: CreatePollParams): Promise<any> {
        if (!this.credenceContract) throw new Error('Contract not initialized')

        // Validation
        if (!pollData.title.trim()) throw new Error('Title is required')
        if (!pollData.description.trim()) throw new Error('Description is required')
        if (pollData.options.length < 2 || pollData.options.length > 6) {
            throw new Error('Must have 2-6 options')
        }

        const rewardWei = ethers.parseEther(pollData.rewardPerResponse.toString())
        const totalReward = rewardWei * BigInt(pollData.targetResponses)
        const platformFee = (totalReward * BigInt(10)) / BigInt(100)
        const totalPayment = totalReward + platformFee

        const params = {
            title: pollData.title,
            description: pollData.description,
            category: pollData.category,
            options: pollData.options,
            rewardPerResponse: rewardWei,
            targetResponses: pollData.targetResponses,
            duration: pollData.duration
        }

        const tx = await this.credenceContract.createPoll(params, {
            value: totalPayment,
            gasLimit: 800000
        })
        return await tx.wait()
    }

    async getAllPolls(): Promise<Poll[]> {
        if (!this.credenceContract) return []

        try {
            const nextId = await this.credenceContract.nextPollId()
            const polls: Poll[] = []

            for (let i = 1; i < Number(nextId); i++) {
                const poll = await this.getPoll(i)
                if (poll) polls.push(poll)
            }

            return polls.reverse()
        } catch (error) {
            console.error('Error fetching all polls:', error)
            return []
        }
    }

    async getPoll(pollId: number): Promise<Poll | null> {
        if (!this.credenceContract) return null

        try {
            const result = await this.credenceContract.getPoll(pollId)

            const options: string[] = []
            const votes: number[] = []

            for (let i = 0; i < 6; i++) {
                try {
                    const option = await this.credenceContract.getPollOption(pollId, i)
                    const voteCount = await this.credenceContract.getPollVotes(pollId, i)

                    if (option && option.trim()) {
                        options.push(option)
                        votes.push(Number(voteCount))
                    } else {
                        break
                    }
                } catch {
                    break
                }
            }

            return {
                id: Number(result.id),
                creator: result.creator,
                title: result.title,
                description: result.description,
                category: result.category,
                walrusHash: result.walrusHash,
                rewardPerResponse: ethers.formatEther(result.rewardPerResponse),
                targetResponses: Number(result.targetResponses),
                currentResponses: Number(result.currentResponses),
                startTime: new Date(Number(result.startTime) * 1000),
                endTime: new Date(Number(result.endTime) * 1000),
                active: result.active,
                options,
                votes
            }
        } catch (error) {
            console.error(`Error fetching poll ${pollId}:`, error)
            return null
        }
    }

    async respondToPoll(pollId: number, optionIndex: number): Promise<any> {
        if (!this.credenceContract) throw new Error('Contract not initialized')

        const tx = await this.credenceContract.respondToPoll(pollId, optionIndex, {
            gasLimit: 250000
        })
        return await tx.wait()
    }

    // Weekly Competition
    async voteForWeeklyAward(nominee: string, reason: string): Promise<any> {
        if (!this.credenceContract) throw new Error('Contract not initialized')

        const tx = await this.credenceContract.voteForWeeklyAward(nominee, reason, {
            gasLimit: 150000
        })
        return await tx.wait()
    }

    async getWeeklyNominees(): Promise<{ addresses: string[], votes: number[] }> {
        if (!this.credenceContract) return { addresses: [], votes: [] }

        try {
            const [addresses, votes] = await this.credenceContract.getWeeklyNominees()
            return {
                addresses: addresses,
                votes: votes.map((v: any) => Number(v))
            }
        } catch (error) {
            console.error('Error fetching weekly nominees:', error)
            return { addresses: [], votes: [] }
        }
    }

    // Admin Functions
    async enableStrictVerification(): Promise<any> {
        if (!this.credenceContract) throw new Error('Contract not initialized')

        const tx = await this.credenceContract.setStrictVerificationConfig({
            gasLimit: 200000
        })
        return await tx.wait()
    }

    async getVerificationConfigId(): Promise<string> {
        if (!this.credenceContract) return ''

        try {
            return await this.credenceContract.verificationConfigId()
        } catch (error) {
            console.error('Error getting verification config ID:', error)
            return ''
        }
    }

    async getPlatformFeePercent(): Promise<number> {
        if (!this.credenceContract) return 0

        try {
            const fee = await this.credenceContract.platformFeePercent()
            return Number(fee)
        } catch (error) {
            console.error('Error getting platform fee:', error)
            return 0
        }
    }

    // Utility functions
    getUserAddress(): string | null {
        return this.userAddress
    }

    getContractAddress(): string {
        return this.contractAddress
    }

    getConfigId(): string {
        return SELF_CONFIG_ID
    }

    getScope(): string {
        return this.contractScope
    }

    isInitialized(): boolean {
        return this.credenceContract !== null && this.userAddress !== null
    }

    disconnect(): void {
        this.provider = null
        this.signer = null
        this.credenceContract = null
        this.tokenContract = null
        this.userAddress = null
    }
}

export const contractService = new ContractService()