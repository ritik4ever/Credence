'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { SelfVerification } from './SelfVerification'
import { contractService } from '@/lib/contracts'
import { ConnectButton } from '@rainbow-me/rainbowkit'

interface VerificationGateProps {
    children: ReactNode
}

export function VerificationGate({ children }: VerificationGateProps) {
    const { address, isConnected } = useAccount()
    const { data: walletClient } = useWalletClient()
    const [isVerified, setIsVerified] = useState(false)
    const [showVerification, setShowVerification] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isSubscriber, setIsSubscriber] = useState(false)

    useEffect(() => {
        if (isConnected && address && walletClient) {
            checkVerificationStatus()
        } else {
            setLoading(false)
        }
    }, [isConnected, address, walletClient])

    const checkVerificationStatus = async () => {
        if (!address || !walletClient) return

        setLoading(true)
        try {
            await contractService.initialize(walletClient)

            const verified = await contractService.isUserVerified(address)
            setIsVerified(verified)

            const subscription = await contractService.getSubscriptionStatus(address)
            setIsSubscriber(subscription)

            if (!verified) {
                setShowVerification(true)
            }
        } catch (error) {
            console.error('Error checking verification:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleVerificationSuccess = () => {
        setIsVerified(true)
        setShowVerification(false)
    }

    const handleSubscribe = async () => {
        try {
            if (!walletClient) {
                console.error('Wallet client not available')
                return
            }
            await contractService.purchaseSubscription()
            setIsSubscriber(true)
        } catch (error) {
            console.error('Subscription failed:', error)
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Credence...</p>
                </div>
            </div>
        )
    }

    // Wallet connection required
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Credence</h1>
                        <p className="text-gray-600">Privacy-preserving polling platform</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-2">Before you start:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Connect your wallet to Celo Sepolia testnet</li>
                            <li>• Verify your identity with Self Protocol</li>
                            <li>• Start earning CRED tokens for authentic opinions</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <ConnectButton />

                        <div className="text-center">
                            <p className="text-xs text-gray-500">
                                By connecting, you agree to verify your identity while maintaining complete privacy through zero-knowledge proofs.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Verification required - mandatory gate
    if (!isVerified) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
                {/* Always show verification modal for unverified users */}
                <SelfVerification
                    onSuccess={handleVerificationSuccess}
                    onClose={() => { }} // Don't allow closing until verified
                    userAddress={address || ''}
                />

                {/* Background content (blurred and disabled) */}
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full mx-4 text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-purple-600 text-2xl">🔒</span>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Identity Verification Required</h2>
                        <p className="text-gray-600 mb-6">
                            Credence requires Self Protocol verification to ensure authentic human participation while maintaining your complete privacy.
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2">What you get after verification:</h3>
                            <ul className="text-sm text-gray-700 space-y-1 text-left">
                                <li>✓ Create and participate in polls</li>
                                <li>✓ Earn CRED tokens for responses</li>
                                <li>✓ Access to weekly community awards</li>
                                <li>✓ Premium features with subscription</li>
                                <li>✓ Vote for best community contributors</li>
                            </ul>
                        </div>

                        <p className="text-sm text-gray-500">
                            Verification uses zero-knowledge proofs - your personal data never leaves your device.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // User is verified - show app with subscription status
    return (
        <div className="min-h-screen bg-white">
            {/* Subscription status banner for verified users */}
            {!isSubscriber && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-sm font-medium">
                                ⭐ Upgrade to Premium to vote for weekly community awards and unlock exclusive features
                            </span>
                        </div>
                        <button
                            onClick={handleSubscribe}
                            className="bg-white text-purple-600 px-4 py-1 rounded-full text-sm font-medium hover:bg-gray-100"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>
            )}

            {children}
        </div>
    )
}