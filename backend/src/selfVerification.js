const axios = require('axios')

class SelfBackendVerifier {
    constructor(scope, endpointUrl, mockPassport = false, supportedIds, configStore, userIdType = 'hex') {
        this.scope = scope
        this.endpointUrl = endpointUrl
        this.mockPassport = mockPassport
        this.supportedIds = supportedIds
        this.configStore = configStore
        this.userIdType = userIdType
    }

    async verify(attestationId, proof, publicSignals, userContextData) {
        try {
            // In production, this would verify the actual zero-knowledge proof
            // For now, we'll implement a verification flow that works with Self Protocol's structure

            console.log('Verifying Self Protocol proof:', {
                attestationId,
                scope: this.scope,
                userIdType: this.userIdType
            })

            // Validate proof structure
            if (!proof || !publicSignals || !Array.isArray(publicSignals)) {
                return {
                    isValidDetails: {
                        isValid: false,
                        reason: 'Invalid proof structure'
                    }
                }
            }

            // Parse user context data
            let contextData = {}
            try {
                contextData = typeof userContextData === 'string'
                    ? JSON.parse(userContextData)
                    : userContextData
            } catch (e) {
                contextData = { userContextData }
            }

            // Verify against Self Protocol's verification service
            // This would be the actual Self Protocol verification endpoint
            const verificationResult = await this.callSelfProtocolAPI(attestationId, proof, publicSignals, contextData)

            if (verificationResult.success) {
                const discloseOutput = {
                    nullifier: verificationResult.nullifier,
                    userIdentifier: verificationResult.userIdentifier,
                    nationality: verificationResult.nationality,
                    ageAbove18: verificationResult.ageAbove18,
                    attestationId: attestationId,
                    scope: this.scope
                }

                return {
                    isValidDetails: {
                        isValid: true,
                        verified: true
                    },
                    discloseOutput
                }
            } else {
                return {
                    isValidDetails: {
                        isValid: false,
                        reason: verificationResult.reason || 'Verification failed'
                    }
                }
            }
        } catch (error) {
            console.error('Self Protocol verification error:', error)
            return {
                isValidDetails: {
                    isValid: false,
                    reason: error.message || 'Verification service error'
                }
            }
        }
    }

    async callSelfProtocolAPI(attestationId, proof, publicSignals, contextData) {
        try {
            // This would call the actual Self Protocol verification service
            const response = await axios.post('https://api.self.xyz/verify', {
                attestationId,
                proof,
                publicSignals,
                scope: this.scope,
                contextData
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SELF_PROTOCOL_API_KEY}`
                },
                timeout: 30000
            })

            return response.data
        } catch (error) {
            console.error('Self Protocol API call failed:', error)

            // For development, return mock success
            if (process.env.NODE_ENV === 'development') {
                return {
                    success: true,
                    nullifier: `nullifier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    userIdentifier: contextData.userAddress || `0x${Math.random().toString(16).substr(2, 40)}`,
                    nationality: 'USA',
                    ageAbove18: true,
                    reason: 'Mock verification for development'
                }
            }

            throw error
        }
    }
}

// Configuration store for Self Protocol
class DefaultConfigStore {
    constructor(config) {
        this.config = config
    }

    getConfig() {
        return this.config
    }
}

// Supported attestation IDs
const AllIds = {
    PASSPORT: 1,
    EU_ID_CARD: 2,
    AADHAAR: 3
}

module.exports = {
    SelfBackendVerifier,
    DefaultConfigStore,
    AllIds
}