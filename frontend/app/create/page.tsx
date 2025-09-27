'use client'

import { useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { Header } from '@/components/Header'
import { contractService } from '@/lib/contracts'
import { Plus, X, Calculator } from 'lucide-react'

export default function CreatePage() {
    const { address } = useAccount()
    const { data: walletClient } = useWalletClient()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'general',
        options: ['', ''],
        rewardPerResponse: 15,
        targetResponses: 100,
        duration: 7
    })

    const addOption = () => {
        if (formData.options.length < 6) {
            setFormData(prev => ({
                ...prev,
                options: [...prev.options, '']
            }))
        }
    }

    const removeOption = (index: number) => {
        if (formData.options.length > 2) {
            setFormData(prev => ({
                ...prev,
                options: prev.options.filter((_, i) => i !== index)
            }))
        }
    }

    const updateOption = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.map((opt, i) => i === index ? value : opt)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!address || !walletClient) {
            alert('Please connect your wallet')
            return
        }

        // Validate form
        if (formData.options.some(opt => !opt.trim())) {
            alert('Please fill in all options')
            return
        }

        setLoading(true)
        try {
            await contractService.initialize(walletClient)
            await contractService.createPoll(formData)

            alert('Poll created successfully!')

            // Reset form
            setFormData({
                title: '',
                description: '',
                category: 'general',
                options: ['', ''],
                rewardPerResponse: 15,
                targetResponses: 100,
                duration: 7
            })
        } catch (error) {
            console.error('Failed to create poll:', error)
            alert('Failed to create poll. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const totalReward = formData.rewardPerResponse * formData.targetResponses
    const platformFee = Math.floor(totalReward * 0.1)
    const totalCost = totalReward + platformFee

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Poll</h1>
                    <p className="text-gray-600">Design a poll to gather verified human insights</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Poll Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                                    placeholder="What's your poll about?"
                                    required
                                    maxLength={100}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none resize-none"
                                    rows={4}
                                    placeholder="Provide context and details about your poll..."
                                    required
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                                    >
                                        <option value="general">General</option>
                                        <option value="technology">Technology</option>
                                        <option value="environment">Environment</option>
                                        <option value="entertainment">Entertainment</option>
                                        <option value="business">Business</option>
                                        <option value="lifestyle">Lifestyle</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                                        min="1"
                                        max="30"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Poll Options */}
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Poll Options</h2>

                        <div className="space-y-4">
                            {formData.options.map((option, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => updateOption(index, e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                                        placeholder={`Option ${index + 1}`}
                                        required
                                        maxLength={100}
                                    />
                                    {formData.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="px-3 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {formData.options.length < 6 && (
                                <button
                                    type="button"
                                    onClick={addOption}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Option
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Rewards & Targets */}
                    <div className="border border-gray-200 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Rewards & Targets</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reward per Response (CRED)
                                </label>
                                <input
                                    type="number"
                                    value={formData.rewardPerResponse}
                                    onChange={(e) => setFormData(prev => ({ ...prev, rewardPerResponse: parseInt(e.target.value) || 1 }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                                    min="1"
                                    max="1000"
                                />
                                <p className="text-xs text-gray-500 mt-1">Higher rewards attract more participants</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Responses</label>
                                <input
                                    type="number"
                                    value={formData.targetResponses}
                                    onChange={(e) => setFormData(prev => ({ ...prev, targetResponses: parseInt(e.target.value) || 10 }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-gray-400 focus:outline-none"
                                    min="10"
                                    max="10000"
                                />
                                <p className="text-xs text-gray-500 mt-1">How many responses do you need?</p>
                            </div>
                        </div>

                        {/* Cost Breakdown */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <Calculator className="h-4 w-4 text-gray-600" />
                                <h3 className="font-medium text-gray-900">Cost Breakdown</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Rewards:</span>
                                    <span className="font-medium">{totalReward} CRED</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Platform Fee (10%):</span>
                                    <span className="font-medium">{platformFee} CRED</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 font-semibold">
                                    <span className="text-gray-900">Total Cost:</span>
                                    <span className="text-gray-900">{totalCost} CRED</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading || !address}
                            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Poll...' : `Create Poll (${totalCost} CRED)`}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}