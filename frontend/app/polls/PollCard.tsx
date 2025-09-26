'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, Users, Coins, ExternalLink } from 'lucide-react'
import { Poll } from '@/types/poll'
import { formatDistanceToNow } from 'date-fns'

interface PollCardProps {
    poll: Poll
}

export function PollCard({ poll }: PollCardProps) {
    const timeRemaining = formatDistanceToNow(new Date(poll.endDate), { addSuffix: true })
    const progressPercentage = (poll.responses / poll.targetResponses) * 100

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="card p-6 group cursor-pointer"
        >
            {/* Poll Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full mb-2">
                        {poll.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {poll.title}
                    </h3>
                </div>
                <div className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                    <Coins className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{poll.reward} CRED</span>
                </div>
            </div>

            {/* Poll Description */}
            <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                {poll.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Responses</span>
                    <span>{poll.responses}/{poll.targetResponses}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Poll Stats */}
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Ends {timeRemaining}</span>
                </div>
                <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{poll.responses} responses</span>
                </div>
            </div>

            {/* Action Button */}
            <Link
                href={`/polls/${poll.id}`}
                className="w-full btn-primary py-3 text-center group-hover:shadow-md transition-all duration-200 flex items-center justify-center"
            >
                Participate Now
                <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Requirements */}
            {poll.requirements.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Requirements: {poll.requirements.join(', ')}
                    </p>
                </div>
            )}
        </motion.div>
    )
}