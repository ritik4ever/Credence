'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const stats = [
    { label: 'Verified Humans', value: 12453, suffix: '+' },
    { label: 'Polls Created', value: 1289, suffix: '+' },
    { label: 'Responses Collected', value: 89764, suffix: '+' },
    { label: 'Rewards Distributed', value: 156, suffix: 'K CRED' }
]

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        const duration = 2000
        const increment = value / (duration / 16)
        let current = 0

        const timer = setInterval(() => {
            current += increment
            if (current >= value) {
                setDisplayValue(value)
                clearInterval(timer)
            } else {
                setDisplayValue(Math.floor(current))
            }
        }, 16)

        return () => clearInterval(timer)
    }, [value])

    return (
        <span>
            {displayValue.toLocaleString()}{suffix}
        </span>
    )
}

export function Statistics() {
    return (
        <section className="py-16 bg-primary-600">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Trusted by Thousands
                    </h2>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        Join our growing community of verified humans earning rewards for authentic insights
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-blue-100 font-medium text-sm md:text-base">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}