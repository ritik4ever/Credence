'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, Clock, Users, Coins } from 'lucide-react'
import { useToast } from '@/components/ui/toaster'
import { walrusService } from '@/services/walrus'
import { useContracts } from '@/services/contracts'

interface Question {
    id: string
    type: 'multiple-choice' | 'text' | 'rating'
    question: string
    options?: string[]
    required: boolean
}

export function CreatePollForm() {
    const { toast } = useToast()
    const { contractService, initializeContracts, isReady } = useContracts()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'general',
        rewardPerResponse: 5,
        targetResponses: 100,
        duration: 7, // days
        requirements: ['Age 18+'] as string[]
    })

    const [questions, setQuestions] = useState<Question[]>([
        {
            id: '1',
            type: 'multiple-choice',
            question: '',
            options: ['', ''],
            required: true
        }
    ])

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newRequirement, setNewRequirement] = useState('')

    const categories = [
        'general', 'technology', 'sports', 'entertainment',
        'politics', 'business', 'lifestyle', 'education'
    ]

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            type: 'multiple-choice',
            question: '',
            options: ['', ''],
            required: true
        }
        setQuestions([...questions, newQuestion])
    }

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, ...updates } : q
        ))
    }

    const removeQuestion = (id: string) => {
        if (questions.length > 1) {
            setQuestions(questions.filter(q => q.id !== id))
        }
    }

    const addOption = (questionId: string) => {
        const question = questions.find(q => q.id === questionId)
        if (question && question.options) {
            updateQuestion(questionId, {
                options: [...question.options, '']
            })
        }
    }

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        const question = questions.find(q => q.id === questionId)
        if (question && question.options) {
            const newOptions = [...question.options]
            newOptions[optionIndex] = value
            updateQuestion(questionId, { options: newOptions })
        }
    }

    const removeOption = (questionId: string, optionIndex: number) => {
        const question = questions.find(q => q.id === questionId)
        if (question && question.options && question.options.length > 2) {
            const newOptions = question.options.filter((_, index) => index !== optionIndex)
            updateQuestion(questionId, { options: newOptions })
        }
    }

    const addRequirement = () => {
        if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
            setFormData({
                ...formData,
                requirements: [...formData.requirements, newRequirement.trim()]
            })
            setNewRequirement('')
        }
    }

    const removeRequirement = (requirement: string) => {
        setFormData({
            ...formData,
            requirements: formData.requirements.filter(req => req !== requirement)
        })
    }

    const calculateCosts = () => {
        const totalReward = formData.rewardPerResponse * formData.targetResponses
        const platformFee = totalReward * 0.1
        const totalCost = totalReward + platformFee

        return { totalReward, platformFee, totalCost }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Validate form
            if (!formData.title.trim() || !formData.description.trim()) {
                throw new Error('Title and description are required')
            }

            if (questions.some(q => !q.question.trim())) {
                throw new Error('All questions must have content')
            }

            // Initialize contracts if not ready
            if (!isReady) {
                await initializeContracts()
            }

            // Prepare poll data for Walrus
            const pollData = {
                ...formData,
                questions: questions.filter(q => q.question.trim()),
                createdAt: new Date().toISOString(),
                version: '1.0'
            }

            // Upload to Walrus
            toast({
                type: 'info',
                title: 'Uploading poll data...',
                description: 'Storing your poll on decentralized storage'
            })

            const blobId = await walrusService.uploadPollData(pollData)

            // Create poll on blockchain
            toast({
                type: 'info',
                title: 'Creating poll on blockchain...',
                description: 'This may take a few moments'
            })

            const { totalCost } = calculateCosts()

            const tx = await contractService.createPoll({
                title: formData.title,
                description: formData.description,
                category: formData.category,
                ipfsHash: blobId,
                rewardPerResponse: formData.rewardPerResponse,
                targetResponses: formData.targetResponses,
                duration: formData.duration * 24 * 60 * 60, // Convert days to seconds
                totalPayment: totalCost.toString()
            })

            toast({
                type: 'success',
                title: 'Poll created successfully!',
                description: `Transaction hash: ${tx.transactionHash}`
            })

            // Reset form
            setFormData({
                title: '',
                description: '',
                category: 'general',
                rewardPerResponse: 5,
                targetResponses: 100,
                duration: 7,
                requirements: ['Age 18+']
            })

            setQuestions([{
                id: '1',
                type: 'multiple-choice',
                question: '',
                options: ['', ''],
                required: true
            }])

        } catch (error: any) {
            console.error('Error creating poll:', error)
            toast({
                type: 'error',
                title: 'Failed to create poll',
                description: error.message || 'Please try again'
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const { totalReward, platformFee, totalCost } = calculateCosts()

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="card p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Basic Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Poll Title *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="What's your poll about?"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Provide context and explain what you're trying to learn..."
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration (days)
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                                min="1"
                                max="30"
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Rewards & Targets */}
            <div className="card p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Rewards & Targets</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reward per Response (CRED)
                        </label>
                        <div className="relative">
                            <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="number"
                                value={formData.rewardPerResponse}
                                onChange={(e) => setFormData({ ...formData, rewardPerResponse: parseInt(e.target.value) || 1 })}
                                min="1"
                                max="100"
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Responses
                        </label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="number"
                                value={formData.targetResponses}
                                onChange={(e) => setFormData({ ...formData, targetResponses: parseInt(e.target.value) || 1 })}
                                min="10"
                                max="10000"
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Cost Breakdown */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Cost Breakdown</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Rewards:</span>
                            <span className="font-medium">{totalReward} CRED</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Platform Fee (10%):</span>
                            <span className="font-medium">{platformFee} CRED</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="font-semibold text-gray-900">Total Cost:</span>
                            <span className="font-semibold text-primary-600">{totalCost} CRED</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="card p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Questions</h2>
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="btn-secondary px-4 py-2 flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                    </button>
                </div>

                <div className="space-y-6">
                    {questions.map((question, index) => (
                        <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 rounded-lg p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Question {index + 1}
                                </h3>
                                {questions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(question.id)}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Question Text *
                                    </label>
                                    <input
                                        type="text"
                                        value={question.question}
                                        onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                                        placeholder="What do you want to ask?"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Question Type
                                        </label>
                                        <select
                                            value={question.type}
                                            onChange={(e) => updateQuestion(question.id, {
                                                type: e.target.value as Question['type'],
                                                options: e.target.value === 'multiple-choice' ? ['', ''] : undefined
                                            })}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        >
                                            <option value="multiple-choice">Multiple Choice</option>
                                            <option value="text">Text Response</option>
                                            <option value="rating">Rating (1-10)</option>
                                        </select>
                                    </div>

                                    <div className="flex items-end">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={question.required}
                                                onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Required</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Multiple Choice Options */}
                                {question.type === 'multiple-choice' && question.options && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Answer Options
                                        </label>
                                        <div className="space-y-2">
                                            {question.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                                        placeholder={`Option ${optionIndex + 1}`}
                                                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    />
                                                    {question.options!.length > 2 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(question.id, optionIndex)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addOption(question.id)}
                                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                + Add Option
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Requirements */}
            <div className="card p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Requirements</h2>

                <div className="space-y-4">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newRequirement}
                            onChange={(e) => setNewRequirement(e.target.value)}
                            placeholder="Add a requirement (e.g., Age 21+, US residents only)"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                        />
                        <button
                            type="button"
                            onClick={addRequirement}
                            className="btn-secondary px-4 py-3"
                        >
                            Add
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.requirements.map((requirement) => (
                            <div
                                key={requirement}
                                className="flex items-center bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                            >
                                <span>{requirement}</span>
                                <button
                                    type="button"
                                    onClick={() => removeRequirement(requirement)}
                                    className="ml-2 text-primary-500 hover:text-primary-700"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Creating Poll...' : `Create Poll (${totalCost} CRED)`}
                </button>
            </div>
        </form>
    )
}