'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { Header } from '@/components/Header'
import { contractService } from '@/lib/contracts'
import { TrendingUp, Clock, Gift, Download } from 'lucide-react'

export default function RewardsPage() {
    const { address } = useAccount()
    const { data: walletClient } = useWalletClient()
    const [loading, setLoading] = useState(true)
    const [claiming, setClaiming] = useState(false)
    const [rewardData, setRewardData] = useState({
        totalEarned: '0',
        available: '0',
        tokenBalance: '0'
    })

    useEffect(() => {
        if (address && walletClient) {
            loadRewardData()
        }
    }, [address, walletClient])

    const loadRewardData = async () => {
        try {
            setLoading(true)
            await contractService.initialize(walletClient)

            const [userRewards, tokenBalance] = await Promise.all([
                contractService.getUserRewards(address!),
                contractService.getTokenBalance(address!)
            ])

            setRewardData({
                totalEarned: userRewards,
                available: userRewards,
                tokenBalance
            })
        } catch (error) {
            console.error('Failed to load reward data:', error)
        } finally {
            setLoading(false)
        }
    }

    const claimRewards = async () => {
        if (!address || parseFloat(rewardData.available) === 0) return

        setClaiming(true)
        try {
            await contractService.claimRewards()
            alert('Rewards claimed successfully!')
            await loadRewardData()
        } catch (error) {
            console.error('Failed to claim rewards:', error)
            alert('Failed to claim rewards. Please try again.')
        } finally {
            setClaiming(false)
        }
    }

    if (!address) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-6xl mx-auto px-6 py-20 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
                    <p className="text-gray-600">Please connect your wallet to view your rewards</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Rewards</h1>
                    <p className="text-gray-600">Track your earnings and claim your rewards from poll participation</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
                                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total Earned */}
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                                <span className="text-sm text-green-600 font-medium">All Time</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Earned</h3>
                            <div className="text-3xl font-bold text-gray-900">{rewardData.totalEarned}</div>
                            <div className="text-gray-500 text-sm">CRED Tokens</div>
                        </div>

                        {/* Token Balance */}
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-blue-600" />
                                </div>
                                <span className="text-sm text-blue-600 font-medium">Current</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Token Balance</h3>
                            <div className="text-3xl font-bold text-gray-900">{rewardData.tokenBalance}</div>
                            <div className="text-gray-500 text-sm">CRED Tokens</div>
                        </div>

                        {/* Available to Claim */}
                        <div className="border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Gift className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available to Claim</h3>
                            <div className="text-3xl font-bold text-gray-900 mb-4">{rewardData.available}</div>
                            <button
                                onClick={claimRewards}
                                disabled={claiming || parseFloat(rewardData.available) === 0}
                                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {claiming ? 'Claiming...' : 'Claim Rewards'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Activity History */}
                <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                            <Download className="h-4 w-4" />
                            Export
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                action: 'Poll Response',
                                poll: 'Remote Work Preferences',
                                reward: '+15',
                                date: '2 hours ago',
                                type: 'earn'
                            },
                            {
                                action: 'Poll Response',
                                poll: 'Sustainable Energy Priorities',
                                reward: '+25',
                                date: '1 day ago',
                                type: 'earn'
                            },
                            {
                                action: 'Rewards Claimed',
                                poll: 'Batch Transaction',
                                reward: '-100',
                                date: '3 days ago',
                                type: 'claim'
                            },
                            {
                                action: 'Poll Response',
                                poll: 'Best Streaming Platform',
                                reward: '+20',
                                date: '5 days ago',
                                type: 'earn'
                            }
                        ].map((activity, index) => (
                            <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                                <div>
                                    <div className="font-medium text-gray-900">{activity.action}</div>
                                    <div className="text-sm text-gray-500">{activity.poll}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-semibold ${activity.type === 'earn' ? 'text-green-600' : 'text-gray-900'
                                        }`}>
                                        {activity.reward} CRED
                                    </div>
                                    <div className="text-sm text-gray-500">{activity.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Section */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">Progress to Next Level</h3>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Active Participant</span>
                            <span>Next: Trusted Contributor</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div className="bg-gray-900 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>650 / 1000 responses</span>
                            <span>+20% bonus rewards at next level</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}