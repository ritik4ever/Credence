'use client'

import { ReactNode } from 'react'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { celoAlfajores, celo } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

const { chains, publicClient } = configureChains(
    [celoAlfajores, celo],
    [publicProvider()]
)

const { connectors } = getDefaultWallets({
    appName: 'Credence',
    projectId: 'credence-polling-platform',
    chains
})

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient
})

interface ProvidersProps {
    children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains} theme="light">
                {children}
            </RainbowKitProvider>
        </WagmiConfig>
    )
}