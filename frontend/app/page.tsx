import { Hero } from '@/components/sections/Hero'
import { Features } from '@/components/sections/Features'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Statistics } from '@/components/sections/Statistics'
import { CTA } from '@/components/sections/CTA'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
    return (
        <div className="min-h-screen">
            <Header />
            <main>
                <Hero />
                <Features />
                <Statistics />
                <HowItWorks />
                <CTA />
            </main>
            <Footer />
        </div>
    )
}