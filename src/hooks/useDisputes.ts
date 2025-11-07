/**
 * Hook for managing disputes data and operations
 * Uses disputeRepository for data access (supports mock and real API)
 */
import { useState, useEffect } from 'react'
import { DisputeI } from '@/src/models/dispute'
import { disputeRepository } from '@/src/repositories/disputeRepository'
import { useToast } from './useToast'

/**
 * Hook for loading and managing disputes
 */
export function useDisputes() {
    const { showError, showSuccess } = useToast()
    const [disputes, setDisputes] = useState<DisputeI[]>([])
    const [loading, setLoading] = useState(true)

    /**
     * Fetch disputes from repository
     */
    const fetchDisputes = async () => {
        try {
            setLoading(true)
            // Fetch escalated disputes (for super admin)
            const escalated = await disputeRepository.getAll({
                level: "SUPER_ADMIN",
                status: "ESCALATED"
            })
            // Also fetch resolved disputes for stats
            const resolved = await disputeRepository.getAll({
                level: "SUPER_ADMIN",
                status: "RESOLVED"
            })
            setDisputes([...escalated, ...resolved])
        } catch (error) {
            console.error("Failed to load disputes:", error)
            showError("Failed to load disputes")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDisputes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Resolve a dispute
     * @param disputeId - Dispute ID (numeric)
     * @param resolution - Resolution text
     */
    const resolveDispute = async (disputeId: number, resolution: string) => {
        try {
            const updated = await disputeRepository.update(disputeId, {
                status: "RESOLVED",
                resolution,
                resolvedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
            
            setDisputes((prev) =>
                prev.map((d) => (d.id === disputeId ? updated : d))
            )
            
            showSuccess("Dispute resolved successfully")
        } catch (error) {
            console.error("Failed to resolve dispute:", error)
            showError("Failed to resolve dispute. Please try again.")
        }
    }

    const escalatedDisputes = disputes.filter((d) => d.status === "ESCALATED")
    const resolvedDisputes = disputes.filter((d) => d.status === "RESOLVED")

    return {
        disputes,
        escalatedDisputes,
        resolvedDisputes,
        loading,
        resolveDispute,
        setDisputes,
        refetch: fetchDisputes
    }
}






