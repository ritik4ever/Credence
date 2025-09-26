'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Users, Coins, Shield, Info, CheckCircle } from 'lucide-react'
import { Poll } from '@/types/poll'
import { PollQuestion } from './PollQuestion'
import { formatDistanceToNow } from 'date-fns'

interface PollDetailsProps {
    poll: Poll
    onParticipate: () => void
    isVerified: boolean
}

export function PollDetails({ poll, onParticipate, isVerified }: PollDetailsProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [responses, setResponses] = useState<Record<string, any>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const timeRemaining = formatDistanceToNow(new Date(poll.endDate), { addSuffix: true })
    const progressPercentage = (poll.responses / poll.targetResponses) * 100

    const handleQuestionResponse = (questionId: string, response: any) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: response
        }))
    }

    const handleNext = () => {
        if (currentQuestionIndex < poll.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            handleSubmit()
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            // Submit responses to backend
            console.log('Submitting responses:', responses)
            // Handle success
        } catch (error) {
            console.error('Error submitting responses:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Poll Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-8 mb-8"
            >
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <span className="inline-block px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full mb-3">
                            {poll.category}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            {poll.title}
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            {poll.description}
                        </p>
                    </div>
                    <div className="ml-6 text-right">
                        <div className="flex items-center text-green-600 bg-green-100 px-4 py-2 rounded-lg mb-3">
                            <Coins className="h-5 w-5 mr-2" />
                            <span className="text-lg font-semibold">{poll.reward} CRED</span>
                        </div>
                        <p className="text-sm text-gray-500">Reward per response</p>
                    </div>
                </div>

                {/* Poll Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Time Remaining</p>
                            <p className="font-semibold">{timeRemaining}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Responses</p>
                            <p className="font-semibold">{poll.responses}/{poll.targetResponses}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Shield className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm text-gray-500">Verification</p>
                            <p className="font-semibold">Self Protocol</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}% complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Requirements */}
                {poll.requirements.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-blue-900 mb-1">Requirements</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    {poll.requirements.map((req, index) => (
                                        <li key={index} className="flex items-center">
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Poll Questions */}
            {isVerified ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-8"
                >
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Question {currentQuestionIndex + 1} of {poll.questions.length}
                            </h2>
                            <div className="text-sm text-gray-500">
                                {Math.round(((currentQuestionIndex + 1) / poll.questions.length) * 100)}% complete
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${((currentQuestionIndex + 1) / poll.questions.length) * 100}%` }}
                            />
                        </div>
                    </div>

                    <PollQuestion
                        question={poll.questions[currentQuestionIndex]}
                        onResponse={(response) => handleQuestionResponse(poll.questions[currentQuestionIndex].id, response)}
                        currentResponse={responses[poll.questions[currentQuestionIndex].id]}
                    />

                    <div className="flex justify-between mt-8">
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="btn-secondary px-6 py-3 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!responses[poll.questions[currentQuestionIndex].id] || isSubmitting}
                            className="btn-primary px-6 py-3 disabled:opacity-50"
                        >
                            {currentQuestionIndex === poll.questions.length - 1 ?
                                (isSubmitting ? 'Submitting...' : 'Submit Poll') :
                                'Next Question'}
                        </button>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card p-8 text-center"
                >
                    <Shield className="h-16 w-16 text-primary-600 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Verification Required
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        To ensure authentic responses, you need to verify your identity using Self Protocol.
                        This process is completely private and doesn't reveal any personal information.
                    </p>
                    <button
                        onClick={onParticipate}
                        className="btn-primary px-8 py-4 text-lg"
                    >
                        Verify & Participate
                    </button>
                </motion.div>
            )}
        </div>
    )
}