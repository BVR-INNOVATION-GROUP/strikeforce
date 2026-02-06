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
    showCheckboxes?: boolean
    onRowClick?: (item: T) => void
    onSelectRow: (id: string, checked: boolean) => void
    onEdit?: (item: T) => void
    onDelete?: (item: T) => void
    startIndex?: number
}

function TableBody<T extends { id: string }>(props: Props<T>) {
    const { data, columns, selectedRows, showActions, showCheckboxes = true, onRowClick, onSelectRow, onEdit, onDelete, startIndex = 0 } = props

    if (data.length === 0) {
        return (
            <tbody>
                <tr>
                    <td
                        colSpan={columns.length + (showCheckboxes ? 1 : 0) + (showActions ? 1 : 0)}
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
            {data.map((item, index) => {
                const rawId = item.id != null ? String(item.id) : ""
                const rowKey = rawId !== "" && rawId !== "undefined" ? rawId : `row-${startIndex + index}`
                const isSelected = selectedRows.has(rowKey)
                return (
                    <tr
                        key={rowKey}
                        className={`border-custom border-b ${isSelected ? 'bg-pale-primary' : 'hover:bg-pale'
                            } ${onRowClick ? 'cursor-pointer' : ''}`}
                        onClick={() => !showActions && onRowClick?.(item)}
                    >
                        {showCheckboxes && (
                            <td className="py-4 px-4">
                                <Checkbox
                                    checked={isSelected}
                                    onChange={(checked) => onSelectRow(rowKey, checked)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </td>
                        )}
                        {columns.map((column) => (
                            <td key={column.key} className="py-4 px-4 text-sm text-secondary">
                                {column.render
                                    ? column.render(item)
                                    : (item[column.key as keyof T] as ReactNode)}
                            </td>
                        ))}
                        {showActions && (
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                    {onEdit && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onEdit(item)
                                            }}
                                            className="p-1 rounded hover:bg-pale text-secondary"
                                            title="Edit"
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
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                    {/* Only show more actions if there are no edit/delete actions */}
                                    {!onEdit && !onDelete && (
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1 rounded hover:bg-pale text-secondary"
                                        >
                                            <MoreVertical size={14} />
                                        </button>
                                    )}
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



