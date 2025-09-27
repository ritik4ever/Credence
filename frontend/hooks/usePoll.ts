'use client'

import { useState } from 'react'
import { Poll } from '@/types/poll'

const mockPollData: Poll = {
    id: '1',
    title: 'Best Cricket Player for Brand Endorsement',
    description: 'Help us choose the most popular cricket player for our upcoming sports brand campaign. Your opinion matters in shaping the future of sports marketing!',
    category: 'sports',
    creator: '0x1234...5678',
    reward: 15,
    targetResponses: 1000,
    responses: 847,
    startDate: '2025-01-15',
    endDate: '2025-02-15',
    status: 'active',
    requirements: ['Age 18+', 'Valid government ID', 'No previous participation'],
    questions: [
        {
            id: 'q1',
            type: 'multiple-choice',
            question: 'Which cricket player would you most likely trust to endorse a sports brand?',
            options: ['Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'KL Rahul', 'Hardik Pandya'],
            required: true
        },
        {
            id: 'q2',
            type: 'rating',
            question: 'Rate the trustworthiness of your chosen player on a scale of 1-10',
            min: 1,
            max: 10,
            required: true
        },
        {
            id: 'q3',
            type: 'text',
            question: 'What specific qualities make this player suitable for brand endorsement?',
            placeholder: 'Share your thoughts on their leadership, popularity, authenticity...',
            required: true
        },
        {
            id: 'q4',
            type: 'multiple-choice',
            question: 'What type of brands would suit this player best?',
            options: ['Sports Equipment', 'Fashion & Lifestyle', 'Technology', 'Food & Beverages', 'Automobiles'],
            allowMultiple: true,
            required: false
        }
    ]
}

export function usePoll(pollId: string) {
    const [poll, setPoll] = useState<Poll | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchPoll = async () => {
        setLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800))

            if (pollId === '1') {
                setPoll(mockPollData)
            } else {
                setPoll(null)
            }
        } catch (error) {
            console.error('Error fetching poll:', error)
            setPoll(null)
        } finally {
            setLoading(false)
        }
    }

    return {
        poll,
        loading,
        fetchPoll
    }
}