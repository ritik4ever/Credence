'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { Header } from '@/components/Header'
import { SelfVerification } from '@/components/SelfVerification'
import { contractService } from '@/lib/contracts'
import { Search, Clock, Users, Coins } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function PollsPage() {
    const { address } = useAccount()
    const { data: walletClient } = useWalletClient()
    const [polls, setPolls] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showVerification, setShowVerification] = useState(false)
    const [selectedPoll, setSelectedPoll] = useState<any>(null)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')

    useEffect(() => {
        if (walletClient) {
            initializeAndLoadPolls()
        }
    }, [walletClient])

    const initializeAndLoadPolls = async () => {
        try {
            await contractService.initialize(walletClient)
            const allPolls = await contractService.getAllPolls()
            setPolls(allPolls)
        } catch (error) {
            console.error('Failed to load polls:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleVote = (poll: any, optionIndex: number) => {
        if (!address) {
            alert('Please connect your wallet')
            return
        }
        setSelectedPoll(poll)
        setSelectedOption(optionIndex)
        setShowVerification(true)
    }

    const handleVerificationSuccess = async (verificationData: any) => {
        try {
            if (selectedPoll && selectedOption !== null) {
                await contractService.respondToPoll(selectedPoll.id, selectedOption, verificationData)
                setShowVerification(false)
                alert('Vote submitted successfully!')
                initializeAndLoadPolls() // Refresh polls
            }
        } catch (error) {
            console.error('Vote submission failed:', error)
            alert('Failed to submit vote')
        }
    }

    const filteredPolls = polls.filter(poll => {
        const matchesSearch = poll.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || poll.category.toLowerCase() === categoryFilter
        return matchesSearch && matchesCategory
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                <div className="h-3 bg-gray-200 rounded mb-6"></div>
                                <div className="space-y-3">
                                    <div className="h-8 bg-gray-200 rounded"></div>
                                    <div className="h-8 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Polls</h1>
                    <p className="text-gray-600">Participate and earn CRED tokens for verified responses</p>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search polls..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                    >
                        <option value="all">All Categories</option>
                        <option value="technology">Technology</option>
                        <option value="environment">Environment</option>
                        <option value="general">General</option>
                        <option value="entertainment">Entertainment</option>
                    </select>
                </div>

                {/* Polls Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPolls.map((poll) => {
                        const totalVotes = poll.votes.reduce((sum: number, votes: number) => sum + votes, 0)
                        const timeLeft = poll.endTime > new Date() ? formatDistanceToNow(poll.endTime, { addSuffix: true }) : 'Ended'

                        return (
                            <div key={poll.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        {poll.category}
                                    </span>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {timeLeft}
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{poll.title}</h3>
                                <p className="text-gray-600 text-sm mb-6">{poll.description}</p>

                                <div className="space-y-3 mb-6">
                                    {poll.options.map((option: string, index: number) => {
                                        const percentage = totalVotes > 0 ? (poll.votes[index] / totalVotes) * 100 : 0

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleVote(poll, index)}
                                                disabled={!poll.active || !address}
                                                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">{option}</span>
                                                    <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gray-900 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-1" />
                                        <span>{poll.currentResponses} responses</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Coins className="h-4 w-4 mr-1" />
                                        <span className="text-green-600 font-medium">+{poll.rewardPerResponse} CRED</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filteredPolls.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No polls found matching your criteria</p>
                    </div>
                )}
            </main>

            {showVerification && (
                <SelfVerification
                    onSuccess={handleVerificationSuccess}
                    onClose={() => setShowVerification(false)}
                    userAddress={address!}
                    pollId={selectedPoll?.id}
                />
            )}
        </div>
    )
}