'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronUp, ChevronDown } from 'lucide-react'
import { PollQuestion as PollQuestionType } from '@/types/poll'

interface PollQuestionProps {
    question: PollQuestionType
    onResponse: (response: any) => void
    currentResponse?: any
}

export function PollQuestion({ question, onResponse, currentResponse }: PollQuestionProps) {
    const [response, setResponse] = useState(currentResponse || null)

    useEffect(() => {
        if (response !== null) {
            onResponse(response)
        }
    }, [response, onResponse])

    const renderQuestion = () => {
        switch (question.type) {
            case 'multiple-choice':
                return (
                    <div className="space-y-3">
                        {question.options?.map((option, index) => (
                            <motion.label
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${question.allowMultiple
                                    ? (response?.includes(option) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300')
                                    : (response === option ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300')
                                    }`}
                            >
                                <input
                                    type={question.allowMultiple ? 'checkbox' : 'radio'}
                                    name={question.id}
                                    value={option}
                                    checked={question.allowMultiple ? response?.includes(option) : response === option}
                                    onChange={(e) => {
                                        if (question.allowMultiple) {
                                            const current = response || []
                                            if (e.target.checked) {
                                                setResponse([...current, option])
                                            } else {
                                                setResponse(current.filter((item: string) => item !== option))
                                            }
                                        } else {
                                            setResponse(option)
                                        }
                                    }}
                                    className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-gray-900 font-medium">{option}</span>
                            </motion.label>
                        ))}
                    </div>
                )

            case 'text':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <textarea
                            value={response || ''}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder={question.placeholder || 'Share your thoughts...'}
                            rows={4}
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                        <div className="mt-2 text-sm text-gray-500 text-right">
                            {response?.length || 0} characters
                        </div>
                    </motion.div>
                )

            case 'rating':
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-center space-x-2">
                            {Array.from({ length: question.max || 10 }, (_, i) => i + 1).map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setResponse(num)}
                                    className={`w-12 h-12 rounded-full border-2 font-semibold transition-all duration-200 ${response === num
                                        ? 'border-primary-500 bg-primary-500 text-white'
                                        : 'border-gray-300 text-gray-600 hover:border-primary-300'
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Poor</span>
                            <span>Excellent</span>
                        </div>
                        {response && (
                            <div className="text-center">
                                <div className="flex items-center justify-center space-x-1">
                                    {Array.from({ length: response }, (_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    You rated: {response}/10
                                </p>
                            </div>
                        )}
                    </motion.div>
                )

            case 'ranking':
                return (
                    <RankingQuestion
                        options={question.options || []}
                        onRankingChange={setResponse}
                        currentRanking={response}
                    />
                )

            default:
                return <div>Unsupported question type</div>
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
            </div>
            {renderQuestion()}
        </div>
    )
}

function RankingQuestion({
    options,
    onRankingChange,
    currentRanking
}: {
    options: string[]
    onRankingChange: (ranking: string[]) => void
    currentRanking?: string[]
}) {
    const [ranking, setRanking] = useState<string[]>(currentRanking || [...options])

    const moveItem = (fromIndex: number, toIndex: number) => {
        const newRanking = [...ranking]
        const [movedItem] = newRanking.splice(fromIndex, 1)
        newRanking.splice(toIndex, 0, movedItem)
        setRanking(newRanking)
        onRankingChange(newRanking)
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
                Drag or use arrows to reorder items by preference (most important first)
            </p>
            {ranking.map((item, index) => (
                <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                    <div className="flex flex-col space-y-1 mr-3">
                        <button
                            onClick={() => index > 0 && moveItem(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                            <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => index < ranking.length - 1 && moveItem(index, index + 1)}
                            disabled={index === ranking.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="flex items-center flex-1">
                        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                            {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{item}</span>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}