'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface Toast {
    id: string
    type: 'success' | 'error' | 'info'
    title: string
    description?: string
    duration?: number
}

let toastCount = 0
const toasts: Toast[] = []
const listeners: Array<(toasts: Toast[]) => void> = []

function addToast(toast: Omit<Toast, 'id'>) {
    const id = (++toastCount).toString()
    const newToast = { ...toast, id }
    toasts.push(newToast)
    listeners.forEach(listener => listener([...toasts]))

    setTimeout(() => {
        removeToast(id)
    }, toast.duration || 5000)
}

function removeToast(id: string) {
    const index = toasts.findIndex(t => t.id === id)
    if (index > -1) {
        toasts.splice(index, 1)
        listeners.forEach(listener => listener([...toasts]))
    }
}

export function useToast() {
    const [toastList, setToastList] = useState<Toast[]>([])

    useEffect(() => {
        listeners.push(setToastList)
        return () => {
            const index = listeners.indexOf(setToastList)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [])

    return {
        toast: addToast,
        toasts: toastList
    }
}

export function Toaster() {
    const { toasts } = useToast()

    const getIcon = (type: Toast['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-600" />
            case 'info':
                return <Info className="h-5 w-5 text-blue-600" />
        }
    }

    const getColors = (type: Toast['type']) => {
        switch (type) {
            case 'success':
                return 'border-green-200 bg-green-50'
            case 'error':
                return 'border-red-200 bg-red-50'
            case 'info':
                return 'border-blue-200 bg-blue-50'
        }
    }

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 300, scale: 0.3 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 300, scale: 0.5 }}
                        transition={{ duration: 0.3 }}
                        className={`max-w-sm w-full p-4 rounded-lg border shadow-lg ${getColors(toast.type)}`}
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                {getIcon(toast.type)}
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    {toast.title}
                                </p>
                                {toast.description && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        {toast.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}