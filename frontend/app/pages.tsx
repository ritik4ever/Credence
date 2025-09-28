import { Header } from '@/components/Header'
import Link from 'next/link'

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="max-w-6xl mx-auto px-6 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                Authentic Voices,{' '}
                                <span className="gradient-text">
                                    Anonymous Opinions
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Get real insights from verified humans while maintaining complete privacy.
                                Earn CRED tokens for authentic responses using Self Protocol verification.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/polls" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-center font-semibold hover:shadow-lg transition-all duration-300">
                                    Start Participating
                                </Link>
                                <Link href="/create" className="bg-white text-gray-900 px-8 py-4 rounded-full text-center font-semibold border border-gray-200 hover:bg-gray-50 transition-all duration-300">
                                    Create a Poll
                                </Link>
                            </div>
                        </div>

                        {/* Beautiful Poll Preview */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Technology</span>
                                    <span className="text-sm text-gray-500">2 days left</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">What's your preferred remote work setup?</h3>
                                <p className="text-gray-600 text-sm mb-6">Help us understand modern work preferences</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Home office</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                                            </div>
                                            <span className="text-sm font-semibold text-blue-600">45%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Co-working space</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="w-1/2 h-full bg-purple-500 rounded-full"></div>
                                            </div>
                                            <span className="text-sm font-semibold text-purple-600">30%</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Coffee shop</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="w-1/4 h-full bg-green-500 rounded-full"></div>
                                            </div>
                                            <span className="text-sm font-semibold text-green-600">25%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
                                    <span>1,234 responses</span>
                                    <span className="text-green-600 font-semibold">+15 CRED</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-gray-50 py-20">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Credence?</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Built for the future of market research with blockchain technology and human verification
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    title: 'Privacy First',
                                    description: 'Zero-knowledge proofs ensure complete anonymity while proving humanity',
                                    color: 'from-blue-50 to-blue-100',
                                    icon: '🔒'
                                },
                                {
                                    title: 'Human Verified',
                                    description: 'Self Protocol integration eliminates bots and ensures authentic responses',
                                    color: 'from-green-50 to-green-100',
                                    icon: '✓'
                                },
                                {
                                    title: 'Earn Rewards',
                                    description: 'Get paid for participating in polls and providing quality insights',
                                    color: 'from-purple-50 to-purple-100',
                                    icon: '💰'
                                },
                                {
                                    title: 'Global Access',
                                    description: 'Decentralized platform accessible to verified humans worldwide',
                                    color: 'from-orange-50 to-orange-100',
                                    icon: '🌍'
                                }
                            ].map((feature, index) => (
                                <div key={index} className={`text-center bg-gradient-to-br ${feature.color} rounded-2xl p-8 hover:scale-105 transition-transform duration-300`}>
                                    <div className="text-4xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-600">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="py-20">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
                            <p className="text-xl text-gray-600">Simple steps to start earning rewards for your authentic opinions</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                {
                                    step: '1',
                                    title: 'Verify Identity',
                                    description: 'Use Self Protocol to prove you\'re human while maintaining complete privacy through zero-knowledge proofs',
                                    color: 'from-blue-500 to-blue-600'
                                },
                                {
                                    step: '2',
                                    title: 'Participate',
                                    description: 'Browse available polls and share your authentic opinions anonymously on topics that matter',
                                    color: 'from-purple-500 to-purple-600'
                                },
                                {
                                    step: '3',
                                    title: 'Earn Rewards',
                                    description: 'Get paid in CRED tokens for each verified poll response and quality contribution to the platform',
                                    color: 'from-green-500 to-green-600'
                                }
                            ].map((step, index) => (
                                <div key={index} className="text-center">
                                    <div className="relative mb-8">
                                        <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                                            <span className="text-3xl font-bold text-white">{step.step}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                                    <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center text-white mb-12">
                            <h2 className="text-4xl font-bold mb-4">Trusted by Thousands</h2>
                            <p className="text-xl opacity-90">Join our growing community of verified humans</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                            {[
                                { number: '12,453+', label: 'Verified Users' },
                                { number: '1,289+', label: 'Polls Created' },
                                { number: '89,764+', label: 'Responses Collected' },
                                { number: '156K', label: 'CRED Distributed' }
                            ].map((stat, index) => (
                                <div key={index}>
                                    <div className="text-4xl font-bold mb-2">{stat.number}</div>
                                    <div className="text-lg opacity-90">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            Ready to Share Your Authentic Voice?
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Join thousands of verified humans earning rewards for their genuine opinions.
                            Your voice matters, your privacy is protected.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/polls" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300">
                                Start Earning Today
                            </Link>
                            <Link href="/create" className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold border border-gray-200 hover:bg-gray-50 transition-all duration-300">
                                Create Your Poll
                            </Link>
                        </div>

                        <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
                            <span className="flex items-center">
                                🔒 Privacy-first
                            </span>
                            <span className="flex items-center">
                                ✓ Human-verified
                            </span>
                            <span className="flex items-center">
                                💰 Instant rewards
                            </span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}