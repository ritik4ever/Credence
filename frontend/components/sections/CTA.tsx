'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTA() {
    return (
        <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-accent-600/90" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full filter blur-3xl" />

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <Sparkles className="h-12 w-12 text-yellow-300 mx-auto mb-6" />

                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Ready to Share Your
                        <br />
                        <span className="text-yellow-300">Authentic Voice?</span>
                    </h2>

                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of verified humans earning rewards for their genuine opinions.
                        Your voice matters, your privacy is protected.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/polls"
                            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl group"
                        >
                            Start Earning Today
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/create"
                            className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-200"
                        >
                            Create Your Poll
                        </Link>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="mt-12 text-blue-100"
                    >
                        <p className="text-sm">
                            🔒 Privacy-first • 🎯 Human-verified • 💰 Instant rewards
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}