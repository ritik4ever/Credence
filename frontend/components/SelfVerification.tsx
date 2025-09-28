'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { SelfQRcodeWrapper, SelfAppBuilder } from '@selfxyz/qrcode'

interface SelfVerificationProps {
    onSuccess: (data: any) => void
    onClose: () => void
    userAddress: string
    pollId?: string
}

export function SelfVerification({ onSuccess, onClose, userAddress, pollId }: SelfVerificationProps) {
    const [selfApp, setSelfApp] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        const initializeSelfApp = async () => {
            try {
                console.log('Initializing Self app for user:', userAddress)

                const app = new SelfAppBuilder({
                    version: 2,
                    appName: 'Credence',
                    scope: 'credence-polls',
                    endpoint: '0x0a621595b5d5114C49e188D25E749E8e0eCa5e2c'.toLowerCase(),
                    logoBase64: 'https://i.postimg.cc/mrmVf9hm/self.png',
                    userId: userAddress,
                    userIdType: 'hex',
                    endpointType: 'staging_celo',
                    userDefinedData: JSON.stringify({
                        userAddress,
                        pollId: pollId || null,
                        timestamp: Date.now()
                    }),
                    disclosures: {
                        minimumAge: 18,
                        excludedCountries: ['IRN', 'PRK'],
                        ofac: false, // Disable OFAC for testing
                        nationality: true
                    }
                }).build()

                console.log('Self app created successfully:', app)
                setSelfApp(app)
                setLoading(false)
            } catch (error: any) {
                console.error('Failed to initialize Self app:', error)
                setError(error.message || 'Failed to initialize verification')
                setLoading(false)
            }
        }

        if (userAddress) {
            initializeSelfApp()
        }
    }, [userAddress, pollId])

    const handleSuccessfulVerification = () => {
        console.log('Verification successful!')
        onSuccess({ verified: true })
    }

    const handleVerificationError = (error: any) => {
        console.error('Verification failed:', error)
        setError('Verification failed: ' + (error.reason || error.message || 'Unknown error'))
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing Self Protocol...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Self Protocol Verification</h2>
                    {onClose !== (() => { }) && (
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>
                    )}
                </div>

                <div className="text-center">
                    {error ? (
                        <div className="py-8">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={() => {
                                    setError('')
                                    setLoading(true)
                                    window.location.reload()
                                }}
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : selfApp ? (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan with Self App</h3>
                            <p className="text-gray-600 mb-6">
                                Use the Self mobile app to scan the QR code and verify your identity.
                            </p>

                            <SelfQRcodeWrapper
                                selfApp={selfApp}
                                onSuccess={handleSuccessfulVerification}
                                onError={handleVerificationError}
                                size={280}
                            />

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                <p className="text-sm text-blue-800">
                                    Don't have the Self app?{' '}
                                    <a href="https://self.id" target="_blank" rel="noopener noreferrer" className="underline">
                                        Download here
                                    </a>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8">
                            <p className="text-red-600">Failed to initialize verification. Please try again.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}