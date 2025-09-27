const express = require('express')
const { SelfBackendVerifier, AllIds, DefaultConfigStore } = require('../selfVerification')

const router = express.Router()

// Initialize Self Protocol verifier
const selfBackendVerifier = new SelfBackendVerifier(
    process.env.SELF_SCOPE || 'credence-polls',
    process.env.SELF_ENDPOINT_URL || 'https://api.self.xyz/verify',
    process.env.NODE_ENV === 'development', // mockPassport for development
    AllIds,
    new DefaultConfigStore({
        minimumAge: 18,
        excludedCountries: ['IRN', 'PRK', 'RUS', 'SYR'],
        ofac: true,
    }),
    'hex' // userIdentifierType for EVM addresses
)

router.post('/verify', async (req, res) => {
    try {
        const { attestationId, proof, publicSignals, userContextData } = req.body

        // Validate required fields
        if (!proof || !publicSignals || !attestationId || !userContextData) {
            return res.status(400).json({
                status: 'error',
                result: false,
                reason: 'Missing required fields: proof, publicSignals, attestationId, userContextData',
                error_code: 'MISSING_FIELDS'
            })
        }

        console.log('Processing Self Protocol verification:', {
            attestationId,
            hasProof: !!proof,
            publicSignalsLength: publicSignals?.length || 0
        })

        // Verify the proof using Self Protocol
        const result = await selfBackendVerifier.verify(
            attestationId,    // Document type (1 = passport, 2 = EU ID card, 3 = Aadhaar)
            proof,            // The zero-knowledge proof
            publicSignals,    // Public signals array
            userContextData   // User context data
        )

        console.log('Self Protocol verification result:', {
            isValid: result.isValidDetails.isValid,
            hasDiscloseOutput: !!result.discloseOutput
        })

        if (result.isValidDetails.isValid) {
            // Verification successful
            return res.json({
                status: 'success',
                result: true,
                message: 'Human verification successful',
                userData: {
                    nullifier: result.discloseOutput.nullifier,
                    userIdentifier: result.discloseOutput.userIdentifier,
                    nationality: result.discloseOutput.nationality,
                    ageAbove18: result.discloseOutput.ageAbove18,
                    attestationId: attestationId,
                    scope: result.discloseOutput.scope
                },
                credentialSubject: result.discloseOutput
            })
        } else {
            // Verification failed
            return res.status(400).json({
                status: 'error',
                result: false,
                reason: result.isValidDetails.reason || 'Identity verification failed',
                error_code: 'VERIFICATION_FAILED',
                details: result.isValidDetails
            })
        }
    } catch (error) {
        console.error('Verification endpoint error:', error)

        return res.status(500).json({
            status: 'error',
            result: false,
            reason: error.message || 'Internal server error during verification',
            error_code: 'VERIFICATION_ERROR'
        })
    }
})

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Self Protocol Verification API',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        scope: process.env.SELF_SCOPE
    })
})

module.exports = router