/**
 * Hook for managing disputes data and operations
 */
import { useState, useEffect } from 'react'
import { DisputeI } from '@/src/models/dispute'

/**
 * Hook for loading and managing disputes
 */
export function useDisputes() {
    const [disputes, setDisputes] = useState<DisputeI[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                // Mock escalated disputes - in production, fetch from API
                const sampleDisputes: DisputeI[] = [
                    {
                        id: "dispute-1",
                        subjectType: "MILESTONE",
                        subjectId: "milestone-1",
                        reason: "Quality concerns",
                        description: "Partner disputes the quality of submitted work. Student claims work meets acceptance criteria.",
                        evidence: ["/evidence/doc1.pdf", "/evidence/doc2.pdf"],
                        status: "ESCALATED",
                        level: "SUPER_ADMIN",
                        raisedBy: "user-partner-1",
                        createdAt: "2024-02-15T10:00:00Z",
                        updatedAt: "2024-02-20T10:00:00Z",
                    },
                ]
                setDisputes(sampleDisputes)
            } catch (error) {
                console.error("Failed to load disputes:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    /**
     * Resolve a dispute
     */
    const resolveDispute = (disputeId: string, resolution: string) => {
        setDisputes(
            disputes.map((d) =>
                d.id === disputeId
                    ? {
                        ...d,
                        status: "RESOLVED" as const,
                        resolution,
                        resolvedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }
                    : d
            )
        )
    }

    const escalatedDisputes = disputes.filter((d) => d.status === "ESCALATED")
    const resolvedDisputes = disputes.filter((d) => d.status === "RESOLVED")

    return {
        disputes,
        escalatedDisputes,
        resolvedDisputes,
        loading,
        resolveDispute,
        setDisputes
    }
}





