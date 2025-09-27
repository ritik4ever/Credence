'use client'

import Link from 'next/link'
import { CheckCircle, Twitter, Github, MessageCircle } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        product: [
            { name: 'Polls', href: '/polls' },
            { name: 'Create Poll', href: '/create' },
            { name: 'Leaderboard', href: '/leaderboard' },
            { name: 'Rewards', href: '/rewards' }
        ],
        community: [
            { name: 'Discord', href: '#', icon: MessageCircle },
            { name: 'Twitter', href: '#', icon: Twitter },
            { name: 'GitHub', href: '#', icon: Github }
        ],
        resources: [
            { name: 'Documentation', href: '/docs' },
            { name: 'API', href: '/api' },
            { name: 'Privacy Policy', href: '/privacy' },
            { name: 'Terms of Service', href: '/terms' }
        ]
    }

    return (
        <footer className="bg-gray-900 text-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <CheckCircle className="h-8 w-8 text-primary-400" />
                            <span className="text-2xl font-bold">Credence</span>
                        </Link>
                        <p className="text-gray-300 mb-6 max-w-md">
                            The decentralized polling platform where authentic voices matter.
                            Earn rewards for your verified opinions while maintaining complete privacy.
                        </p>
                        <div className="flex space-x-4">
                            {footerLinks.community.map((item) => (

                                key = { item.name }
                  href = { item.href }
                  className = "text-gray-400 hover:text-white transition-colors"
                  aria - label= { item.name }
                                >
                                <item.icon className="h-6 w-6" />
                </a>
              ))}
                    </div>
                </div>

                {/* Product Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Product</h3>
                    <ul className="space-y-2">
                        {footerLinks.product.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Resources</h3>
                    <ul className="space-y-2">
                        {footerLinks.resources.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm">
                    © {currentYear} Credence. All rights reserved.
                </p>
                <div className="flex items-center space-x-6 mt-4 md:mt-0">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>Powered by</span>
                        <span className="text-white font-medium">Self Protocol</span>
                        <span>•</span>
                        <span className="text-white font-medium">Walrus</span>
                        <span>•</span>
                        <span className="text-white font-medium">Celo</span>
                    </div>
                </div>
            </div>
        </div>
    </footer >
  )
}