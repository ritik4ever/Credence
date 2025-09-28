import React, { useState, useEffect } from 'react'
import { contractService, Poll, UserProfile, CreatePollParams } from '@/lib/contracts'

// Main App Component
export default function CredenceApp() {
    const [isConnected, setIsConnected] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [userAddress, setUserAddress] = useState<string | null>(null)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [polls, setPolls] = useState<Poll[]>([])
    const [error, setError] = useState<string | null>(null)

    // Initialize connection
    const connectWallet = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const address = contractService.getUserAddress()
            setUserAddress(address)
            setIsConnected(true)

            if (address) {
                await loadUserProfile(address)
                await loadPolls()
            }
        } catch (error: any) {
            setError(error.message)
            console.error('Connection failed:', error)
        } finally {
            setIsLoading(false)
        }
    }
    // Load user profile
    const loadUserProfile = async (address: string) => {
        try {
            const profile = await contractService.getUserProfile(address)
            setUserProfile(profile)
        } catch (error) {
            console.error('Failed to load user profile:', error)
        }
    }

    // Load all polls
    const loadPolls = async () => {
        try {
            const allPolls = await contractService.getAllPolls()
            setPolls(allPolls)
        } catch (error) {
            console.error('Failed to load polls:', error)
        }
    }

    // Self Protocol verification
    const handleVerification = async () => {
        if (!userAddress) return

        try {
            const verificationURL = contractService.generateSelfVerificationURL(userAddress)
            window.open(verificationURL, '_blank')
        } catch (error: any) {
            setError(error.message)
        }
    }

    // Check verification status
    const checkVerification = async () => {
        if (!userAddress) return

        const isVerified = await contractService.isUserVerified(userAddress)
        if (isVerified && userAddress) {
            await loadUserProfile(userAddress)
        }
    }

    // Purchase subscription
    const purchaseSubscription = async () => {
        setIsLoading(true)
        try {
            const tx = await contractService.purchaseSubscription()
            console.log('Subscription purchased:', tx)
            if (userAddress) {
                await loadUserProfile(userAddress)
            }
        } catch (error: any) {
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Respond to poll
    const respondToPoll = async (pollId: number, optionIndex: number) => {
        setIsLoading(true)
        try {
            const tx = await contractService.respondToPoll(pollId, optionIndex)
            console.log('Poll response submitted:', tx)
            await loadPolls()
            if (userAddress) {
                await loadUserProfile(userAddress)
            }
        } catch (error: any) {
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Claim rewards
    const claimRewards = async () => {
        setIsLoading(true)
        try {
            const tx = await contractService.claimRewards()
            console.log('Rewards claimed:', tx)
            if (userAddress) {
                await loadUserProfile(userAddress)
            }
        } catch (error: any) {
            setError(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Credence Polling</h1>
                    <p className="text-gray-600">Decentralized polling with Self Protocol verification</p>
                </header>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                        <button
                            onClick={() => setError(null)}
                            className="ml-4 text-sm underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {!isConnected ? (
                    <ConnectWallet onConnect={connectWallet} isLoading={isLoading} />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* User Dashboard */}
                        <div className="lg:col-span-1">
                            <UserDashboard
                                userProfile={userProfile}
                                userAddress={userAddress}
                                onVerify={handleVerification}
                                onCheckVerification={checkVerification}
                                onPurchaseSubscription={purchaseSubscription}
                                onClaimRewards={claimRewards}
                                isLoading={isLoading}
                            />
                        </div>

                        {/* Polls Section */}
                        <div className="lg:col-span-2">
                            <PollsSection
                                polls={polls}
                                userProfile={userProfile}
                                onRespondToPoll={respondToPoll}
                                onRefresh={loadPolls}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Connect Wallet Component
function ConnectWallet({ onConnect, isLoading }: { onConnect: () => void, isLoading: boolean }) {
    return (
        <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
                <p className="text-gray-600 mb-6">
                    Connect your wallet to start creating and participating in polls
                </p>
                <button
                    onClick={onConnect}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                </button>
            </div>
        </div>
    )
}

// User Dashboard Component
function UserDashboard({
    userProfile,
    userAddress,
    onVerify,
    onCheckVerification,
    onPurchaseSubscription,
    onClaimRewards,
    isLoading
}: {
    userProfile: UserProfile | null
    userAddress: string | null
    onVerify: () => void
    onCheckVerification: () => void
    onPurchaseSubscription: () => void
    onClaimRewards: () => void
    isLoading: boolean
}) {
    const [rewards, setRewards] = useState<string>('0')
    const [isSubscriber, setIsSubscriber] = useState<boolean>(false)

    useEffect(() => {
        const loadRewardsAndSubscription = async () => {
            if (userAddress) {
                const userRewards = await contractService.getUserRewards(userAddress)
                const subStatus = await contractService.isSubscriber(userAddress)
                setRewards(userRewards)
                setIsSubscriber(subStatus)
            }
        }
        loadRewardsAndSubscription()
    }, [userAddress, userProfile])

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>

            <div className="space-y-4">
                {/* User Address */}
                <div>
                    <label className="text-sm text-gray-600">Address</label>
                    <p className="font-mono text-sm break-all">
                        {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
                    </p>
                </div>

                {/* Verification Status */}
                <div>
                    <label className="text-sm text-gray-600">Verification Status</label>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${userProfile?.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {userProfile?.isVerified ? 'Verified' : 'Not Verified'}
                        </span>
                        {!userProfile?.isVerified && (
                            <button
                                onClick={onVerify}
                                className="text-blue-600 text-sm underline"
                            >
                                Verify Now
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onCheckVerification}
                        className="text-xs text-gray-500 underline mt-1"
                    >
                        Check Status
                    </button>
                </div>

                {/* Subscription Status */}
                <div>
                    <label className="text-sm text-gray-600">Subscription</label>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${isSubscriber
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {isSubscriber ? 'Premium' : 'Basic'}
                        </span>
                        {!isSubscriber && (
                            <button
                                onClick={onPurchaseSubscription}
                                disabled={isLoading}
                                className="text-blue-600 text-sm underline"
                            >
                                Upgrade (0.1 CELO)
                            </button>
                        )}
                    </div>
                </div>

                {/* Rewards */}
                <div>
                    <label className="text-sm text-gray-600">Available Rewards</label>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">{rewards} CRED</span>
                        {parseFloat(rewards) > 0 && (
                            <button
                                onClick={onClaimRewards}
                                disabled={isLoading}
                                className="text-blue-600 text-sm underline"
                            >
                                Claim
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                {userProfile && (
                    <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-2">Stats</h3>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Total Responses:</span>
                                <span>{userProfile.totalResponses}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Earned:</span>
                                <span>{userProfile.totalEarned} CRED</span>
                            </div>
                            {userProfile.verifiedAt && (
                                <div className="flex justify-between">
                                    <span>Verified:</span>
                                    <span>{userProfile.verifiedAt.toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Polls Section Component
function PollsSection({
    polls,
    userProfile,
    onRespondToPoll,
    onRefresh,
    isLoading
}: {
    polls: Poll[]
    userProfile: UserProfile | null
    onRespondToPoll: (pollId: number, optionIndex: number) => void
    onRefresh: () => void
    isLoading: boolean
}) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Active Polls</h2>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="text-blue-600 underline text-sm"
                >
                    Refresh
                </button>
            </div>

            {polls.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No polls available
                </div>
            ) : (
                <div className="space-y-6">
                    {polls.map((poll) => (
                        <PollCard
                            key={poll.id}
                            poll={poll}
                            userProfile={userProfile}
                            onRespond={onRespondToPoll}
                            isLoading={isLoading}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// Individual Poll Card Component
function PollCard({
    poll,
    userProfile,
    onRespond,
    isLoading
}: {
    poll: Poll
    userProfile: UserProfile | null
    onRespond: (pollId: number, optionIndex: number) => void
    isLoading: boolean
}) {
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const canVote = userProfile?.isVerified && poll.active
    const isExpired = new Date() > poll.endTime
    const progress = (poll.currentResponses / poll.targetResponses) * 100

    const handleVote = () => {
        if (selectedOption !== null) {
            onRespond(poll.id, selectedOption)
        }
    }

    return (
        <div className="border border-gray-200 rounded-lg p-6">
            <div className="mb-4">
                <h3 className="font-semibold text-lg">{poll.title}</h3>
                <p className="text-gray-600 mt-1">{poll.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Category: {poll.category}</span>
                    <span>Reward: {poll.rewardPerResponse} CRED</span>
                    <span>Ends: {poll.endTime.toLocaleDateString()}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{poll.currentResponses}/{poll.targetResponses} responses</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
            </div>

            {/* Poll Options - FIXED: Added explicit type annotations */}
            <div className="space-y-2 mb-4">
                {poll.options.map((option: string, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name={`poll-${poll.id}`}
                                value={index}
                                checked={selectedOption === index}
                                onChange={() => setSelectedOption(index)}
                                disabled={!canVote || isExpired}
                                className="mr-2"
                            />
                            <span>{option}</span>
                        </label>
                        <span className="text-sm text-gray-500">
                            {poll.votes[index] || 0} votes
                        </span>
                    </div>
                ))}
            </div>

            {/* Action Button */}
            {canVote && !isExpired ? (
                <button
                    onClick={handleVote}
                    disabled={selectedOption === null || isLoading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isLoading ? 'Submitting...' : 'Submit Vote'}
                </button>
            ) : (
                <div className="text-center py-2 text-gray-500">
                    {!userProfile?.isVerified && 'Verification required to vote'}
                    {userProfile?.isVerified && isExpired && 'Poll has ended'}
                    {userProfile?.isVerified && !poll.active && 'Poll is not active'}
                </div>
            )}
        </div>
    )
}