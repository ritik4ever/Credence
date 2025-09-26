'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PollDetails } from '@/components/polls/PollDetails'
import { VerificationModal } from '@/components/verification/VerificationModal'
import { usePoll } from '@/hooks/usePoll'
import { useAccount } from 'wagmi'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function PollDetailPage() {
    const { id } = useParams()
    const { address } = useAccount()
    const { poll, loading, fetchPoll } = usePoll(id as string)
    const [showVerification, setShowVerification] = useState(false)
    const [isVerified, setIsVerified] = useState(false)

    useEffect(() => {
        if (id) {
            fetchPoll()
        }
    }, [id])

    const handleParticipate = () => {
        if (!address) {
            // Show connect wallet message
            return
        }

        if (!isVerified) {
            setShowVerification(true)
        } else {
            // Proceed to poll participation
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-20 flex justify-center items-center h-96">
                    <LoadingSpinner size="lg" />
                </div>
                <Footer />
            </div>
        )
    }

    if (!poll) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-20 text-center py-20">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Poll not found</h1>
                    <p className="text-gray-600">The poll you're looking for doesn't exist or has been removed.</p>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="pt-20 pb-16">
                <PollDetails
                    poll={poll}
                    onParticipate={handleParticipate}
                    isVerified={isVerified}
                />
            </main>

            <Footer />

            <VerificationModal
                isOpen={showVerification}
                onClose={() => setShowVerification(false)}
                onSuccess={() => {
                    setIsVerified(true)
                    setShowVerification(false)
                }}
            />
        </div>
    )
}