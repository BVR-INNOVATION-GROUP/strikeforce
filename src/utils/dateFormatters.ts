/**
 * Date formatting utilities
 */
export const formatDateLong = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    } catch {
        return dateString
    }
}

export const formatDateShort = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    } catch {
        return dateString
    }
}

export const calculateDaysUntilDeadline = (deadline: string): number => {
    if (!deadline) return 0
    try {
        const deadlineDate = new Date(deadline.includes('-') ? deadline : new Date().toISOString())
        const today = new Date()
        const diffTime = deadlineDate.getTime() - today.getTime()
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } catch {
        return 0
    }
}

