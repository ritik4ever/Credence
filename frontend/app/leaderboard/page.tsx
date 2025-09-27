'use client'

import { useState } from 'react'
import { Header } from '@/components/Header'
import { Trophy, Medal, Award } from 'lucide-react'

export default function LeaderboardPage() {
    const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all'>('weekly')

    const leaderboardData = [
        {
            rank: 1,
            name: 'CryptoSage',
            address: '0x1234...5678',
            earned: 2450,
            polls: 89,
            accuracy: 94,
            badge: 'Diamond Contributor',
            change: '+2'
        },
        {
            rank: 2,
            name: 'DataMiner',
            address: '0x2345...6789',
            earned: 2180,
            polls: 76,
            accuracy: 91,
            badge: 'Gold Contributor',
            change: '-1'
        },
        {
            rank: 3,
            name: 'PollMaster',
            address: '0x3456...7890',
            earned: 1950,
            polls: 82,
            accuracy: 89,
            badge: 'Gold Contributor',
            change: '+1'
        },
        {
            rank: 4,
            name: 'TruthSeeker',
            address: '0x4567...8901',
            earned: 1820,
            polls: 71,
            accuracy: 92,
            badge: 'Silver Contributor',
            change: '0'
        },
        {
            rank: 5,
            name: 'VoiceOfReason',
            address: '0x5678...9012',
            earned: 1750,
            polls: 68,
            accuracy: 88,
            badge: 'Silver Contributor',
            change: '+3'
        }
    ]

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-6 w-6 text-yellow-500" />
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />
            case 3:
                return <Award className="h-6 w-6 text-orange-500" />
            default:
                return <span className="text-lg font-bold text-gray-600">#{rank}</span>
        }
    }

    const getBadgeColor = (badge: string) => {
        switch (badge) {
            case 'Diamond Contributor':
                return 'bg-blue-100 text-blue-800'
            case 'Gold Contributor':
                return 'bg-yellow-100 text-yellow-800'
            case 'Silver Contributor':
                return 'bg-gray-100 text-gray-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getChangeColor = (change: string) => {
        if (change.startsWith('+')) return 'text-green-600'
        if (change.startsWith('-')) return 'text-red-600'
        return 'text-gray-500'
    }

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
                    <p className="text-gray-600">Top contributors in the Credence community</p>
                </div>

                {/* Timeframe Selector */}
                <div className="mb-8">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                        {(['weekly', 'monthly', 'all'] as const).map((period) => (
                            <button
                                key={period}
                                onClick={() => setTimeframe(period)}
                                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${timeframe === period
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Top 3 Podium */}
                <div className="mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {leaderboardData.slice(0, 3).map((user, index) => (
                            <div
                                key={user.rank}
                                className={`border border-gray-200 rounded-lg p-6 text-center ${user.rank === 1 ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''
                                    }`}
                            >
                                <div className="flex justify-center mb-4">
                                    {getRankIcon(user.rank)}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{user.name}</h3>
                                <p className="text-sm text-gray-500 mb-3">{user.address}</p>
                                <div className="space-y-2">
                                    <div className="text-2xl font-bold text-gray-900">{user.earned}</div>
                                    <div className="text-sm text-gray-500">CRED Earned</div>
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(user.badge)}`}>
                                        {user.badge}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Full Rankings Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Full Rankings</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        CRED Earned
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Polls
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Accuracy
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Change
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leaderboardData.map((user) => (
                                    <tr key={user.rank} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getRankIcon(user.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.address}</div>
                                                <span className={`inline-flex mt-1 px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(user.badge)}`}>
                                                    {user.badge}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.earned}</div>
                                            <div className="text-sm text-gray-500">CRED</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.polls}</div>
                                            <div className="text-sm text-gray-500">Polls</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.accuracy}%</div>
                                            <div className="text-sm text-gray-500">Accuracy</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-medium ${getChangeColor(user.change)}`}>
                                                {user.change !== '0' ? user.change : '—'}
                                            </span>
                                            <div className="text-sm text-gray-500">Change</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Weekly Competition */}
                <div className="mt-12 border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Competition</h2>
                    <p className="text-gray-600 mb-6">
                        Compete for bonus rewards! The most active and accurate contributors each week win extra CRED tokens.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">1000</div>
                            <div className="text-sm text-gray-500">CRED Prize Pool</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">2d 14h</div>
                            <div className="text-sm text-gray-500">Time Left</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">127</div>
                            <div className="text-sm text-gray-500">Participants</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}