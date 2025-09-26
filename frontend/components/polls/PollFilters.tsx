'use client'

import { motion } from 'framer-motion'

interface FilterState {
    category: string
    reward: string
    status: string
}

interface PollFiltersProps {
    filters: FilterState
    setFilters: (filters: FilterState) => void
}

const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'technology', label: 'Technology' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'sports', label: 'Sports' },
    { value: 'politics', label: 'Politics' },
    { value: 'business', label: 'Business' },
    { value: 'lifestyle', label: 'Lifestyle' }
]

const rewardRanges = [
    { value: 'all', label: 'All Rewards' },
    { value: 'low', label: '1-5 CRED' },
    { value: 'medium', label: '6-20 CRED' },
    { value: 'high', label: '21+ CRED' }
]

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'new', label: 'Recently Added' }
]

export function PollFilters({ filters, setFilters }: PollFiltersProps) {
    const updateFilter = (key: keyof FilterState, value: string) => {
        setFilters({ ...filters, [key]: value })
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Category
                    </label>
                    <select
                        value={filters.category}
                        onChange={(e) => updateFilter('category', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Reward Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Reward Range
                    </label>
                    <select
                        value={filters.reward}
                        onChange={(e) => updateFilter('reward', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        {rewardRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Status
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => updateFilter('status', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                    onClick={() => setFilters({ category: 'all', reward: 'all', status: 'active' })}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                    Clear all filters
                </button>
            </div>
        </motion.div>
    )
}