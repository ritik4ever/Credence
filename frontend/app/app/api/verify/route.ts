import { NextRequest, NextResponse } from 'next/server'
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from '@selfxyz/core'

const SELF_SCOPE = process.env.SELF_SCOPE || 'credence-polls'
const SELF_ENDPOINT = process.env.SELF_ENDPOINT_URL || 'https://playground.self.xyz/api/verify'
const IS_STAGING = process.env.NODE_ENV !== 'production'

const selfBackendVerifier = new SelfBackendVerifier(
    SELF_SCOPE,
    SELF_ENDPOINT,
    IS_STAGING,
    AllIds,
    new DefaultConfigStore({
        minimumAge: 18,
        excludedCountries: ['IRN', 'PRK', 'RUS', 'SYR'],
        ofac: true,
    }),
    'hex'
)

const verifiedUsers = new Map<string, any>()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { attestationId, proof, pubSignals, userContextData, userAddress } = body

        console.log('=== Self Protocol Verification Request ===')
        console.log('User Address:', userAddress)
        console.log('Attestation ID:', attestationId)

        if (!proof || !pubSignals || !attestationId || !userContextData) {
            return NextResponse.json(
                {
                    status: 'error',
                    result: false,
                    reason: 'Missing required fields'
                },
                { status: 400 }
            )
        }

        const result = await selfBackendVerifier.verify(
            attestationId,
            proof,
            pubSignals,
            userContextData
        )

        console.log('Full verification result:', JSON.stringify(result, null, 2))

        if (result.isValidDetails.isValid) {
            // Handle both V1 and V2 response formats
            const discloseOutput = result.discloseOutput

            // Check what properties actually exist and log them
            console.log('Available properties in discloseOutput:', Object.keys(discloseOutput))
            console.log('Full discloseOutput object:', discloseOutput)

            // Access properties safely
            const userData = {
                nullifier: discloseOutput.nullifier || 'unknown',
                userIdentifier: (discloseOutput as any).userIdentifier || userAddress || 'unknown',
                nationality: discloseOutput.nationality || 'unknown',
                ageAbove18: (discloseOutput as any).ageAbove18 ?? true, // Use ?? for boolean
                attestationId: attestationId,
                verifiedAt: Date.now(),
                rawDiscloseOutput: discloseOutput
            }

            if (userAddress) {
                verifiedUsers.set(userAddress.toLowerCase(), userData)
                console.log(`User ${userAddress} verified successfully with data:`, userData)
            }

            return NextResponse.json({
                status: 'success',
                result: true,
                message: 'Human verification successful',
                userData,
                credentialSubject: result.discloseOutput
            })
        } else {
            console.log('Verification failed:', result.isValidDetails)
            return NextResponse.json(
                {
                    status: 'error',
                    result: false,
                    reason: 'Identity verification failed',
                    details: result.isValidDetails
                },
                { status: 400 }
            )
        }
    } catch (error: any) {
        console.error('Verification Error:', error)
        return NextResponse.json(
            {
                status: 'error',
                result: false,
                reason: error.message || 'Internal server error'
            },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userAddress = searchParams.get('address')

        if (userAddress) {
            const userData = verifiedUsers.get(userAddress.toLowerCase())
            return NextResponse.json({
                status: 'ok',
                verified: !!userData,
                verifiedAt: userData?.verifiedAt,
                nationality: userData?.nationality,
                ageAbove18: userData?.ageAbove18
            })
        }

        return NextResponse.json({
            status: 'ok',
            service: 'Self Protocol Verification API',
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        return NextResponse.json(
            { status: 'error', reason: error.message },
            { status: 500 }
        )
    }
}