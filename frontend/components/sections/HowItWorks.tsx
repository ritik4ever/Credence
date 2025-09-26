'use client'

import { motion } from 'framer-motion'
import { UserCheck, MessageSquare, Vote, Trophy } from 'lucide-react'

const steps = [
    {
        icon: UserCheck,
        title: 'Verify Your Identity',
        description: 'Use Self Protocol to prove you\'re human while maintaining complete privacy',
        step: '01'
    },
    {
        icon: MessageSquare,
        title: 'Participate in Polls',
        description: 'Browse available polls and share your authentic opinions anonymously',
        step: '02'
    },
    {
        icon: Vote,
        title: 'Earn Rewards',
        description: 'Get paid in tokens for each poll participation and quality contribution',
        step: '03'
    },
    {
        icon: Trophy,
        title: 'Win Weekly Competitions',
        description: 'Community votes on best responses, winners get bonus rewards',
        step: '04'
    }
]

export function HowItWorks() {
    return (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    >
                        How It <span className="gradient-text">Works</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-xl text-gray-600 max-w-3xl mx-auto"
                    >
                        Simple steps to start earning rewards for your authentic opinions
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Connection Line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary-300 to-transparent -translate-x-4 z-0" />
                            )}

                            <div className="card p-6 text-center relative z-10 bg-white">
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                                        <step.icon className="h-8 w-8 text-primary-600" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {step.step}
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}