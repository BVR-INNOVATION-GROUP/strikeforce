/**
 * TableBody component for DataTable
 */
import React, { ReactNode } from 'react'
import Checkbox from '@/src/components/core/Checkbox'
import { Edit, Trash2, MoreVertical } from 'lucide-react'

export interface Column<T> {
    key: string
    render?: (item: T) => ReactNode
}

export interface Props<T extends { id: string }> {
    data: T[]
    columns: Column<T>[]
    selectedRows: Set<string>
    showActions: boolean
    onRowClick?: (item: T) => void
    onSelectRow: (id: string, checked: boolean) => void
    onEdit?: (item: T) => void
    onDelete?: (item: T) => void
}

function TableBody<T extends { id: string }>(props: Props<T>) {
    const { data, columns, selectedRows, showActions, onRowClick, onSelectRow, onEdit, onDelete } = props

    if (data.length === 0) {
        return (
            <tbody>
                <tr>
                    <td
                        colSpan={columns.length + (showActions ? 2 : 1)}
                        className="p-8 text-center text-muted"
                    >
                        No data available
                    </td>
                </tr>
            </tbody>
        )
    }

    return (
        <tbody>
            {data.map((item) => {
                const isSelected = selectedRows.has(item.id)
                return (
                    <tr
                        key={item.id}
                        className={` border-custom ${isSelected ? 'bg-pale-primary' : ' py-4 hover:bg-pale'
                            } ${onRowClick ? 'cursor-pointer' : ''}`}
                        onClick={() => !showActions && onRowClick?.(item)}
                    >
                        <td className="p-3">
                            <Checkbox
                                checked={isSelected}
                                onChange={(checked) => onSelectRow(item.id, checked)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </td>
                        {columns.map((column) => (
                            <td key={column.key} className="p-3 text-sm text-secondary">
                                {column.render
                                    ? column.render(item)
                                    : (item[column.key as keyof T] as ReactNode)}
                            </td>
                        ))}
                        {showActions && (
                            <td className="p-3">
                                <div className="flex items-center gap-2">
                                    {onEdit && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onEdit(item)
                                            }}
                                            className="p-1 rounded hover:bg-pale text-secondary"
                                        >
                                            <Edit size={14} />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDelete(item)
                                            }}
                                            className="p-1 rounded hover:bg-pale text-primary"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1 rounded hover:bg-pale text-secondary"
                                    >
                                        <MoreVertical size={14} />
                                    </button>
                                </div>
                            </td>
                        )}
                    </tr>
                )
            })}
        </tbody>
    )
}

export default TableBody



