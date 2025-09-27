import './globals.css'
import { Providers } from './providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Credence - Human Verified Polling',
    description: 'Decentralized polling with Self Protocol verification and rewards',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="antialiased bg-white">
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}