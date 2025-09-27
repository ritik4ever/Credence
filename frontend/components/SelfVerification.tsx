'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface SelfVerificationProps {
    onSuccess: (data: any) => void
    onClose: () => void
    userAddress: string
    pollId?: string
}

export function SelfVerification({ onSuccess, onClose, userAddress, pollId }: SelfVerificationProps) {
    const [status, setStatus] = useState<'generating' | 'ready' | 'verifying' | 'success' | 'error'>('generating')
    const [qrCode, setQrCode] = useState('')

    useEffect(() => {
        generateQRCode()
        // Start mock verification process
        setTimeout(() => {
            setStatus('ready')
            // Mock success after 5 seconds
            setTimeout(() => {
                setStatus('success')
                setTimeout(() => {
                    onSuccess({
                        proof: '0x' + Math.random().toString(16).substr(2, 64),
                        publicSignals: [1, 2, 3],
                        userContextData: '0x' + Math.random().toString(16).substr(2, 64),
                        nullifier: Date.now().toString()
                    })
                }, 1000)
            }, 5000)
        }, 2000)
    }, [])

    const generateQRCode = async () => {
        // Mock QR code generation
        const canvas = document.createElement('canvas')
        canvas.width = 300
        canvas.height = 300
        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.fillStyle = '#000000'
            // Draw a simple pattern for mock QR
            for (let i = 0; i < 20; i++) {
                for (let j = 0; j < 20; j++) {
                    if (Math.random() > 0.5) {
                        ctx.fillRect(i * 15, j * 15, 12, 12)
                    }
                }
            }
            setQrCode(canvas.toDataURL())
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Human Verification</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="text-center">
                    {status === 'generating' && (
                        <div className="py-8">
                            <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-600">Generating verification code...</p>
                        </div>
                    )}

                    {status === 'ready' && (
                        <div>
                            <div className="mb-4 p-4 border rounded-lg">
                                {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto" />}
                            </div>
                            <p className="text-gray-600 mb-2">Scan with Self Protocol app</p>
                            <p className="text-sm text-gray-500">Prove you're human while staying anonymous</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                <span className="text-green-600 text-2xl">✓</span>
                            </div>
                            <p className="text-gray-600">Verification successful!</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-8">
                            <div className="w-16 h-16 bg-red-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                <span className="text-red-600 text-2xl">✗</span>
                            </div>
                            <p className="text-gray-600 mb-4">Verification failed</p>
                            <button onClick={generateQRCode} className="bg-gray-900 text-white px-6 py-2 rounded-lg">
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}