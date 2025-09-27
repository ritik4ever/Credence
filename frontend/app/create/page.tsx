'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CreatePollForm } from '@/components/create/CreatePollForm'
import { motion } from 'framer-motion'
import { Plus, Lightbulb } from 'lucide-react'

export default function CreatePollPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="pt-20 pb-16">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-primary-100 rounded-full">
                                <Plus className="h-8 w-8 text-primary-600" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Create Your <span className="gradient-text">Poll</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Gather authentic insights from verified humans. Set your requirements,
                            questions, and rewards to get quality responses.
                        </p>
                    </motion.div>

                    {/* Tips Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="card p-6 mb-8 bg-blue-50 border-blue-200"
                    >
                        <div className="flex items-start">
                            <Lightbulb className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">Tips for Better Polls</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Be clear and specific in your questions</li>
                                    <li>• Offer fair rewards to encourage participation</li>
                                    <li>• Set realistic target response numbers</li>
                                    <li>• Keep questions unbiased and neutral</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Create Poll Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <CreatePollForm />
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    )
}