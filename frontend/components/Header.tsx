'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Menu, X } from 'lucide-react'

// Suppress console warnings in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args) => {
        if (args[0]?.includes?.('WalletConnect Core is already initialized')) return
        if (args[0]?.includes?.('Multiple versions of Lit loaded')) return
        originalError.apply(console, args)
    }

    console.warn = (...args) => {
        if (args[0]?.includes?.('Module not found')) return
        if (args[0]?.includes?.('Failed to fetch remote project configuration')) return
        originalWarn.apply(console, args)
    }
}

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    const navigation = [
        { name: 'Polls', href: '/polls' },
        { name: 'Create', href: '/create' },
        { name: 'Leaderboard', href: '/leaderboard' },
        { name: 'Rewards', href: '/rewards' },
    ]

    const isActive = (href: string) => pathname === href

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    <Link href="/" className="text-xl font-semibold text-gray-900">
                        Credence
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-sm font-medium transition-colors ${isActive(item.href)
                                    ? 'text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:block">
                        <ConnectButton />
                    </div>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                <Link href="/community" className="text-gray-600 hover:text-gray-900 font-medium">
                    Community Awards
                </Link>

                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="space-y-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="block text-gray-600 hover:text-gray-900"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="pt-4">
                                <ConnectButton />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    )
}