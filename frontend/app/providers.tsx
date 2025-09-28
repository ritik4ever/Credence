'use client'

import { ReactNode } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@rainbow-me/rainbowkit/styles.css'

// Celo Sepolia Chain Configuration
const celoSepolia = {
    id: 11142220,
    name: 'Celo Sepolia Testnet',
    network: 'celo-sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'CELO',
        symbol: 'CELO',
    },
    rpcUrls: {
        public: { http: ['https://celo-sepolia.drpc.org'] },
        default: { http: ['https://celo-sepolia.drpc.org'] },
    },
    blockExplorers: {
        default: { name: 'Celo Sepolia Explorer', url: 'https://celo-sepolia.blockscout.com' },
    },
    testnet: true,
} as const

// Use a valid project ID or disable WalletConnect
const config = getDefaultConfig({
    appName: 'Credence',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '', // Use empty string as fallback
    chains: [celoSepolia],
    transports: {
        [celoSepolia.id]: http(),
    },
    ssr: true,
})

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
})

export function Providers({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}