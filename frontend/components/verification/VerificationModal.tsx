'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, QrCode, CheckCircle, Loader2 } from 'lucide-react'
import { SelfQRcodeWrapper, SelfAppBuilder } from '@selfxyz/qrcode'
import { getUniversalLink } from '@selfxyz/core'
import { useAccount } from 'wagmi'

interface VerificationModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    pollId?: string
}

export function VerificationModal({ isOpen, onClose, onSuccess, pollId }: VerificationModalProps) {
    const { address } = useAccount()
    const [selfApp, setSelfApp] = useState<any>(null)
    const [universalLink, setUniversalLink] = useState('')
    const [verificationStep, setVerificationStep] = useState<'setup' | 'verify' | 'success'>('setup')
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }, [])

    useEffect(() => {
        if (isOpen && address) {
            initializeSelfApp()
        }
    }, [isOpen, address])

    const initializeSelfApp = () => {
        try {
            const app = new SelfAppBuilder({
                version: 2,
                appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || 'Credence',
                scope: process.env.NEXT_PUBLIC_SELF_SCOPE || 'credence-polls',
                endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
                logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
                userId: address,
                endpointType: 'staging_https',
                userIdType: 'hex',
                userDefinedData: pollId ? JSON.stringify({ pollId }) : 'verification',
                disclosures: {
                    minimumAge: 18,
                    nationality: true,
                    excludedCountries: ['IRN', 'PRK', 'RUS', 'SYR'],
                    ofac: true,
                },
                deeplinkCallback: `${window.location.origin}/verification-success`
            }).build()

            setSelfApp(app)
            setUniversalLink(getUniversalLink(app))
            setVerificationStep('verify')
        } catch (error) {
            console.error('Failed to initialize Self app:', error)
        }
    }

    const handleVerificationSuccess = () => {
        setVerificationStep('success')
        setTimeout(() => {
            onSuccess()
        }, 2000)
    }

    const openSelfApp = () => {
        if (universalLink) {
            window.open(universalLink, '_blank')
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Content */}
                        <div className="text-center">
                            {verificationStep === 'setup' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                                        <Shield className="h-8 w-8 text-primary-600" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                            Human Verification Required
                                        </h3>
                                        <p className="text-gray-600">
                                            Setting up your verification session...
                                        </p>
                                    </div>

                                    <div className="flex justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                                    </div>
                                </motion.div>
                            )}

                            {verificationStep === 'verify' && selfApp && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                                        <QrCode className="h-8 w-8 text-primary-600" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                            Verify Your Identity
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            {isMobile
                                                ? 'Tap the button below to open the Self app and complete verification'
                                                : 'Scan the QR code with the Self app to prove you\'re human while maintaining privacy'
                                            }
                                        </p>
                                    </div>

                                    {isMobile ? (
                                        <button
                                            onClick={openSelfApp}
                                            className="w-full btn-primary py-4 text-lg"
                                            disabled={!universalLink}
                                        >
                                            Open Self App
                                        </button>
                                    ) : (
                                        <div className="flex justify-center">
                                            <SelfQRcodeWrapper
                                                selfApp={selfApp}
                                                onSuccess={handleVerificationSuccess}
                                                onError={(error) => {
                                                    console.error('Verification error:', error)
                                                }}
                                                size={280}
                                                darkMode={false}
                                            />
                                        </div>
                                    )}

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start">
                                            <Shield className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                                            <div className="text-left">
                                                <h4 className="font-medium text-blue-900 mb-1">Privacy Protected</h4>
                                                <p className="text-sm text-blue-800">
                                                    Zero-knowledge proofs ensure your personal data stays private.
                                                    We only verify that you're human without accessing any personal information.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {verificationStep === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                                            Verification Successful!
                                        </h3>
                                        <p className="text-gray-600">
                                            You're now verified and can participate in polls. Redirecting...
                                        </p>
                                    </div>

                                    <div className="flex justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    )
}