import { NextRequest, NextResponse } from 'next/server'
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from '@selfxyz/core'

// Initialize the Self Protocol verifier
const selfBackendVerifier = new SelfBackendVerifier(
    process.env.SELF_SCOPE || 'credence-polls',
    process.env.SELF_ENDPOINT_URL || 'https://playground.self.xyz/api/verify',
    process.env.NODE_ENV !== 'production', // mockPassport for development
    AllIds,
    new DefaultConfigStore({
        minimumAge: 18,
        excludedCountries: ['IRN', 'PRK', 'RUS', 'SYR'],
        ofac: true,
    }),
    'hex' // userIdentifierType for EVM addresses
)

export async function POST(request: NextRequest) {
    try {
        const { attestationId, proof, publicSignals, userContextData } = await request.json()

        // Validate required fields
        if (!proof || !publicSignals || !attestationId || !userContextData) {
            return NextResponse.json(
                {
                    status: 'error',
                    result: false,
                    reason: 'Missing required fields: proof, publicSignals, attestationId, userContextData',
                    error_code: 'MISSING_FIELDS'
                },
                { status: 400 }
            )
        }

        console.log('Verifying proof for attestation:', attestationId)

        // Verify the proof using Self Protocol
        const result = await selfBackendVerifier.verify(
            attestationId,    // Document type (1 = passport, 2 = EU ID card, 3 = Aadhaar)
            proof,            // The zero-knowledge proof
            publicSignals,    // Public signals array
            userContextData   // User context data (hex string)
        )

        console.log('Verification result:', result.isValidDetails.isValid)

        if (result.isValidDetails.isValid) {
            // Extract user data from verification result
            const userData = {
                nullifier: result.discloseOutput.nullifier,
                userIdentifier: result.discloseOutput.userIdentifier,
                nationality: result.discloseOutput.nationality,
                ageAbove18: result.discloseOutput.ageAbove18,
                attestationId: attestationId
            }

            // Log successful verification
            console.log('User verified successfully:', {
                nullifier: userData.nullifier,
                userIdentifier: userData.userIdentifier
            })

            return NextResponse.json({
                status: 'success',
                result: true,
                message: 'Human verification successful',
                userData: userData,
                credentialSubject: result.discloseOutput
            })
        } else {
            // Verification failed
            console.log('Verification failed:', result.isValidDetails)

            return NextResponse.json(
                {
                    status: 'error',
                    result: false,
                    reason: 'Identity verification failed',
                    error_code: 'VERIFICATION_FAILED',
                    details: result.isValidDetails
                },
                { status: 400 }
            )
        }
    } catch (error: any) {
        console.error('Verification error:', error)

        return NextResponse.json(
            {
                status: 'error',
                result: false,
                reason: error.message || 'Internal server error during verification',
                error_code: 'VERIFICATION_ERROR'
            },
            { status: 500 }
        )
    }
}

// Health check endpoint
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        service: 'Self Protocol Verification API',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    })
}