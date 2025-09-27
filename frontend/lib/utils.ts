import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'CRED') {
    return `${amount.toLocaleString()} ${currency}`
}

export function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export function formatTimeRemaining(endDate: string | Date) {
    const end = new Date(endDate)
    const now = new Date()
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return 'Ended'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} days remaining`
    if (hours > 0) return `${hours} hours remaining`
    return 'Ending soon'
}

export function generateId() {
    return Math.random().toString(36).substr(2, 9)
}

export function truncateText(text: string, maxLength: number) {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
}