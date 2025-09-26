import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Credence - Verified Human Polling',
    description: 'Decentralized polling platform with human verification and anonymous participation',
    keywords: 'blockchain, polling, survey, self protocol, decentralized, privacy',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full">
            <body className={`${inter.className} h-full bg-gradient-to-br from-slate-50 to-blue-50`}>
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    )
}