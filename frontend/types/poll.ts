export interface Poll {
    id: string
    title: string
    description: string
    category: string
    creator: string
    reward: number
    targetResponses: number
    responses: number
    startDate: string
    endDate: string
    status: 'active' | 'ended' | 'draft'
    requirements: string[]
    questions: PollQuestion[]
}

export interface PollQuestion {
    id: string
    type: 'multiple-choice' | 'text' | 'rating' | 'ranking'
    question: string
    options?: string[]
    required: boolean
    allowMultiple?: boolean
    placeholder?: string
    min?: number
    max?: number
}

export interface PollResponse {
    questionId: string
    answer: string | string[] | number
    timestamp: number
}

export interface WeeklyCompetition {
    id: string
    week: number
    startDate: string
    endDate: string
    nominations: CompetitionNomination[]
    winner?: string
    totalVotes: number
    reward: number
    status: 'active' | 'voting' | 'ended'
}

export interface CompetitionNomination {
    id: string
    pollId: string
    responseHash: string
    excerpt: string
    votes: number
    anonymous: true
}

export interface UserStats {
    totalPolls: number
    totalEarnings: number
    verificationStatus: boolean
    rank: number
    weeklyWins: number
}