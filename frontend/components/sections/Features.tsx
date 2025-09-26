'use client'

import { motion } from 'framer-motion'
import { Shield, Users, Coins, Award, Eye, Globe } from 'lucide-react'

const features = [
    {
        icon: Shield,
        title: 'Privacy First',
        description: 'Zero-knowledge proofs ensure complete anonymity while proving humanity',
        color: 'bg-blue-100 text-blue-600'
    },
    {
        icon: Users,
        title: 'Human Verified',
        description: 'Self Protocol integration eliminates bots and ensures authentic responses',
        color: 'bg-green-100 text-green-600'
    },
    {
        icon: Coins,
        title: 'Earn Rewards',
        description: 'Get paid for participating in polls and providing quality insights',
        color: 'bg-purple-100 text-purple-600'
    },
    {
        icon: Award,
        title: 'Quality Recognition',
        description: 'Weekly competitions reward the most authentic and thoughtful responses',
        color: 'bg-orange-100 text-orange-600'
    },
    {
        icon: Eye,
        title: 'Transparent Results',
        description: 'Open verification of poll integrity while maintaining participant privacy',
        color: 'bg-indigo-100 text-indigo-600'
    },
    {
        icon: Globe,
        title: 'Global Participation',
        description: 'Decentralized platform accessible to verified humans worldwide',
        color: 'bg-pink-100 text-pink-600'
    }
]

export function Features() {
    return (
        <section className="py-20 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    >
                        Why Choose <span className="gradient-text">Credence</span>?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-xl text-gray-600 max-w-3xl mx-auto"
                    >
                        Built for the future of market research with blockchain technology and human verification
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="card p-8 group hover:scale-105 transition-all duration-300"
                        >
                            <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}