import axios from 'axios'

export class WalrusService {
    private publisherUrl = process.env.NEXT_PUBLIC_WALRUS_PUBLISHER

    async uploadData(data: any): Promise<string> {
        try {
            const formData = new FormData()
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
            formData.append('file', blob)

            const response = await axios.post(`${this.publisherUrl}/v1/store`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            return response.data.blobId
        } catch (error) {
            console.error('Walrus upload failed:', error)
            throw new Error('Failed to upload data to Walrus')
        }
    }

    async downloadData(blobId: string): Promise<any> {
        try {
            const response = await axios.get(`${this.publisherUrl}/v1/retrieve/${blobId}`)
            return response.data
        } catch (error) {
            console.error('Walrus download failed:', error)
            throw new Error('Failed to download data from Walrus')
        }
    }
}

export const walrusService = new WalrusService()