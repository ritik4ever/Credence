'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Users, Award } from 'lucide-react'

export function Hero() {
    return (
        <section className="relative pt-20 pb-16 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20">
                <div className="text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8"
                    >
                        <Shield className="h-4 w-4 mr-2" />
                        Human-verified polling platform
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
                    >
                        Authentic Voices,{' '}
                        <span className="gradient-text">
                            Anonymous Opinions
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
                    >
                        Get real insights from verified humans while maintaining complete privacy.
                        Earn rewards for thoughtful participation in our decentralized polling ecosystem.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
                    >
                        <Link
                            href="/polls"
                            className="btn-primary px-8 py-4 text-lg group"
                        >
                            Start Participating
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/create"
                            className="btn-secondary px-8 py-4 text-lg"
                        >
                            Create a Poll
                        </Link>
                    </motion.div>

                    {/* Feature Pills */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto"
                    >
                        {[
                            { icon: Shield, text: 'Zero-Knowledge Privacy' },
                            { icon: Users, text: 'Human-Verified Only' },
                            { icon: Award, text: 'Earn Rewards' }
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center bg-white/80 px-4 py-2 rounded-full shadow-sm">
                                <feature.icon className="h-5 w-5 text-primary-600 mr-2" />
                                <span className="text-gray-700 font-medium">{feature.text}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}