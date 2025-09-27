interface WalrusUploadResponse {
    blobId: string
    size: number
    cost: number
}

interface WalrusConfig {
    publisherUrl: string
    aggregatorUrl: string
}

class WalrusService {
    private config: WalrusConfig

    constructor() {
        this.config = {
            publisherUrl: process.env.NEXT_PUBLIC_WALRUS_PUBLISHER || 'https://publisher.walrus-testnet.walrus.space',
            aggregatorUrl: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space'
        }
    }

    async uploadPollData(pollData: any): Promise<string> {
        try {
            const response = await fetch(`${this.config.publisherUrl}/v1/blobs`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'poll',
                    data: pollData,
                    timestamp: Date.now()
                })
            })

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`)
            }

            const result = await response.json()
            return result.newlyCreated?.blobObject?.blobId || result.alreadyCertified?.blobId
        } catch (error) {
            console.error('Error uploading to Walrus:', error)
            throw error
        }
    }

    async uploadPollResponse(responseData: any): Promise<string> {
        try {
            const response = await fetch(`${this.config.publisherUrl}/v1/blobs`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'response',
                    data: responseData,
                    timestamp: Date.now(),
                    anonymous: true
                })
            })

            if (!response.ok) {
                throw new Error(`Response upload failed: ${response.statusText}`)
            }

            const result = await response.json()
            return result.newlyCreated?.blobObject?.blobId || result.alreadyCertified?.blobId
        } catch (error) {
            console.error('Error uploading response to Walrus:', error)
            throw error
        }
    }

    async retrieveData(blobId: string): Promise<any> {
        try {
            const response = await fetch(`${this.config.aggregatorUrl}/v1/blobs/${blobId}`)

            if (!response.ok) {
                throw new Error(`Retrieval failed: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error retrieving from Walrus:', error)
            throw error
        }
    }

    async uploadCompetitionData(competitionData: any): Promise<string> {
        try {
            const response = await fetch(`${this.config.publisherUrl}/v1/blobs`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'competition',
                    data: competitionData,
                    timestamp: Date.now()
                })
            })

            if (!response.ok) {
                throw new Error(`Competition upload failed: ${response.statusText}`)
            }

            const result = await response.json()
            return result.newlyCreated?.blobObject?.blobId || result.alreadyCertified?.blobId
        } catch (error) {
            console.error('Error uploading competition data to Walrus:', error)
            throw error
        }
    }

    async checkBlobExists(blobId: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.config.aggregatorUrl}/v1/blobs/${blobId}`, {
                method: 'HEAD'
            })
            return response.ok
        } catch (error) {
            return false
        }
    }
}

export const walrusService = new WalrusService()