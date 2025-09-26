'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PollCard } from '@/components/polls/PollCard'
import { PollFilters } from '@/components/polls/PollFilters'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { usePolls } from '@/hooks/usePolls'
import { Search, Filter } from 'lucide-react'

export default function PollsPage() {
    const { polls, loading, fetchPolls } = usePolls()
    const [searchTerm, setSearchTerm] = useState('')
    const [filterOpen, setFilterOpen] = useState(false)
    const [filters, setFilters] = useState({
        category: 'all',
        reward: 'all',
        status: 'active'
    })

    useEffect(() => {
        fetchPolls()
    }, [])

    const filteredPolls = polls.filter(poll => {
        const matchesSearch = poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            poll.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = filters.category === 'all' || poll.category === filters.category
        const matchesStatus = filters.status === 'all' || poll.status === filters.status
        return matchesSearch && matchesCategory && matchesStatus
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="pt-20 pb-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Available <span className="gradient-text">Polls</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl">
                            Participate in verified polls and earn rewards for your authentic opinions
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search polls..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="btn-secondary px-6 py-3 flex items-center"
                        >
                            <Filter className="h-5 w-5 mr-2" />
                            Filters
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {filterOpen && (
                        <div className="mb-8">
                            <PollFilters filters={filters} setFilters={setFilters} />
                        </div>
                    )}

                    {/* Polls Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPolls.map((poll) => (
                                <PollCard key={poll.id} poll={poll} />
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && filteredPolls.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-gray-400 mb-4">
                                <Search className="h-16 w-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No polls found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}