'use client'

import { useState } from 'react'
import { Poll } from '@/types/poll'

// Mock data for development
const mockPolls: Poll[] = [
    {
        id: '1',
        title: 'Best Cricket Player for Brand Endorsement',
        description: 'Help us choose the most popular cricket player for our upcoming sports brand campaign. Your opinion matters!',
        category: 'sports',
        creator: '0x1234...5678',
        reward: 15,
        targetResponses: 1000,
        responses: 847,
        startDate: '2025-01-15',
        endDate: '2025-02-15',
        status: 'active',
        requirements: ['Age 18+', 'Valid ID'],
        questions: [
            {
                id: 'q1',
                type: 'multiple-choice',
                question: 'Which cricket player would you most likely trust to endorse a sports brand?',
                options: ['Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'KL Rahul'],
                required: true
            },
            {
                id: 'q2',
                type: 'text',
                question: 'What qualities make this player suitable for brand endorsement?',
                required: true
            }
        ]
    },
    {
        id: '2',
        title: 'Smartphone Features Priority Survey',
        description: 'Tech companies want to know what features matter most to users in 2025. Share your preferences!',
        category: 'technology',
        creator: '0x2345...6789',
        reward: 8,
        targetResponses: 2000,
        responses: 1456,
        startDate: '2025-01-10',
        endDate: '2025-02-10',
        status: 'active',
        requirements: ['Age 16+'],
        questions: [
            {
                id: 'q1',
                type: 'ranking',
                question: 'Rank these smartphone features by importance to you',
                options: ['Battery Life', 'Camera Quality', 'Processing Speed', 'Storage Space', 'Display Quality'],
                required: true
            }
        ]
    },
    {
        id: '3',
        title: 'Movie Genre Preferences 2025',
        description: 'Streaming platforms want to understand audience preferences for content creation decisions.',
        category: 'entertainment',
        creator: '0x3456...7890',
        reward: 12,
        targetResponses: 1500,
        responses: 298,
        startDate: '2025-01-20',
        endDate: '2025-03-20',
        status: 'active',
        requirements: ['Age 13+'],
        questions: [
            {
                id: 'q1',
                type: 'multiple-choice',
                question: 'What movie genre do you watch most frequently?',
                options: ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Romance'],
                required: true
            }
        ]
    }
]

export function usePolls() {
    const [polls, setPolls] = useState<Poll[]>([])
    const [loading, setLoading] = useState(false)

    const fetchPolls = async () => {
        setLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            setPolls(mockPolls)
        } catch (error) {
            console.error('Error fetching polls:', error)
        } finally {
            setLoading(false)
        }
    }

    return {
        polls,
        loading,
        fetchPolls
    }
}