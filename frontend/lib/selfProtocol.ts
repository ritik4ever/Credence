import QRCode from 'qrcode'
import axios from 'axios'

export interface SelfVerificationData {
    nullifier: string
    userIdentifier: string
    nationality: string
    ageAbove18: boolean
    attestationId: string
    responseHash: string
    proof: string
    publicSignals: number[]
    userContextData: string
}

export class SelfProtocolService {
    async generateQRCode(userAddress: string, pollId?: string): Promise<string> {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        const verificationData = {
            version: 2,
            appName: process.env.NEXT_PUBLIC_SELF_APP_NAME,
            scope: process.env.NEXT_PUBLIC_SELF_SCOPE,
            endpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify`,
            userId: userAddress,
            userIdType: 'hex',
            endpointType: 'https',
            sessionId,
            userDefinedData: JSON.stringify({
                userAddress,
                pollId: pollId || null,
                action: pollId ? 'poll_response' : 'verification',
                timestamp: Date.now()
            }),
            disclosures: {
                minimumAge: 18,
                excludedCountries: ['IRN', 'PRK', 'RUS', 'SYR'],
                ofac: true,
                nationality: true
            }
        }

        return await QRCode.toDataURL(JSON.stringify(verificationData), {
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#FFFFFF' }
        })
    }

    async checkVerificationStatus(sessionId: string): Promise<any> {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify-status`, {
                params: { sessionId }
            })
            return response.data
        } catch (error) {
            console.error('Status check failed:', error)
            return { status: 'pending' }
        }
    }

    async submitVerification(verificationData: any): Promise<SelfVerificationData> {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify`, verificationData)

        if (response.data.status === 'success') {
            return response.data.userData
        } else {
            throw new Error(response.data.reason || 'Verification failed')
        }
    }
}

export const selfProtocolService = new SelfProtocolService()