/**
 * Dispute table column definitions
 */
import Button from '@/src/components/core/Button'
import StatusIndicator from '@/src/components/core/StatusIndicator'
import { DisputeI } from '@/src/models/dispute'
import { Column } from '@/src/components/base/DataTable'
import { Scale } from 'lucide-react'

/**
 * Get table columns for disputes
 */
export const getDisputeColumns = (
    onResolve: (dispute: DisputeI) => void
): Column<DisputeI>[] => {
    return [
        {
            key: "subjectType",
            header: "Subject",
            render: (item) => (
                <span className="capitalize">{item.subjectType.toLowerCase()}</span>
            ),
        },
        {
            key: "reason",
            header: "Reason",
        },
        {
            key: "status",
            header: "Status",
            render: (item) => <StatusIndicator status={item.status} />,
        },
        {
            key: "level",
            header: "Level",
            render: (item) => (
                <span className="capitalize">{item.level.replace("_", " ").toLowerCase()}</span>
            ),
        },
        {
            key: "createdAt",
            header: "Created",
            render: (item) => new Date(item.createdAt).toLocaleDateString(),
        },
        {
            key: "actions",
            header: "Actions",
            render: (item) =>
                item.status === "ESCALATED" ? (
                    <Button
                        onClick={() => onResolve(item)}
                        className="bg-primary text-white text-xs px-3 py-1"
                    >
                        <Scale size={12} className="mr-1" />
                        Resolve
                    </Button>
                ) : (
                    <StatusIndicator status={item.status} />
                ),
        },
    ]
}






