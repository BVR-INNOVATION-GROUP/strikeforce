/**
 * BulkActionsBar component for DataTable
 * Shows when rows are selected
 */
import React from 'react'
import { Copy, Printer, Trash2, X } from 'lucide-react'

export interface Props {
    selectedCount: number
    onBulkAction: (action: string) => void
    onClearSelection: () => void
}

function BulkActionsBar(props: Props) {
    const { selectedCount, onBulkAction, onClearSelection } = props

    return (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-custom px-4 py-3 z-50 flex items-center gap-4">
            <span className="text-sm font-medium text-secondary">
                {selectedCount} Selected
            </span>
            <div className="w-px h-6 bg-custom"></div>
            <button
                onClick={() => onBulkAction('duplicate')}
                className="flex items-center gap-2 px-3 py-1 rounded hover:bg-pale text-sm text-secondary"
            >
                <Copy size={14} />
                <span>Duplicate</span>
            </button>
            <button
                onClick={() => onBulkAction('print')}
                className="flex items-center gap-2 px-3 py-1 rounded hover:bg-pale text-sm text-secondary"
            >
                <Printer size={14} />
                <span>Print</span>
            </button>
            <button
                onClick={() => onBulkAction('delete')}
                className="flex items-center gap-2 px-3 py-1 rounded hover:bg-pale text-sm text-primary"
            >
                <Trash2 size={14} />
                <span>Delete</span>
            </button>
            <button
                onClick={onClearSelection}
                className="ml-2 p-1 rounded hover:bg-pale"
            >
                <X size={16} className="text-muted" />
            </button>
        </div>
    )
}

export default BulkActionsBar








