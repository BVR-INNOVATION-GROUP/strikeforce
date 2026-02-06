/**
 * TableHeader component for DataTable
 */
import React from 'react'
import Checkbox from '@/src/components/core/Checkbox'
import { ChevronDown, ChevronUp } from 'lucide-react'

export interface Column {
    key: string
    header: string
    sortable?: boolean
}

export interface Props<T> {
    columns: Column[]
    sortColumn: string | null
    sortDirection: 'asc' | 'desc'
    allSelected: boolean
    showActions: boolean
    showCheckboxes?: boolean
    onSelectAll: (checked: boolean) => void
    onSort: (columnKey: string) => void
}

function TableHeader<T>(props: Props<T>) {
    const { columns, sortColumn, sortDirection, allSelected, showActions, showCheckboxes = true, onSelectAll, onSort } = props

    return (
        <thead>
            <tr className="bg-paper border-b border-custom">
                {showCheckboxes && (
                    <th className="text-left py-4 px-4 w-12">
                        <Checkbox checked={allSelected} onChange={onSelectAll} />
                    </th>
                )}
                {columns.map((column) => (
                    <th key={column.key} className="text-left py-4 px-4 text-sm font-semibold text-secondary">
                        <div className="flex items-center gap-2">
                            <span>{column.header}</span>
                            {column.sortable !== false && (
                                <button
                                    onClick={() => onSort(column.key)}
                                    className="flex flex-col items-center justify-center opacity-50 hover:opacity-100"
                                >
                                    <ChevronUp
                                        size={12}
                                        className={`-mb-1 ${sortColumn === column.key && sortDirection === 'asc'
                                            ? 'opacity-100'
                                            : 'opacity-30'
                                            }`}
                                    />
                                    <ChevronDown
                                        size={12}
                                        className={`${sortColumn === column.key && sortDirection === 'desc'
                                            ? 'opacity-100'
                                            : 'opacity-30'
                                            }`}
                                    />
                                </button>
                            )}
                        </div>
                    </th>
                ))}
                {showActions && (
                    <th className="text-left py-4 px-4 text-sm font-semibold text-secondary w-24">Action</th>
                )}
            </tr>
        </thead>
    )
}

export default TableHeader






