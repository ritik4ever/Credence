'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { VerificationGate } from '@/components/VerificationGate'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <VerificationGate>
                        {children}
                    </VerificationGate>
                </Providers>
            </body>
        </html>
    )
}