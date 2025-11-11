/**
 * Custom hook for DataTable logic
 * Handles sorting, pagination, and selection
 */
import { useState, useMemo } from 'react'

export interface UseDataTableOptions<T extends { id: string }> {
    data: T[]
    pageSize: number
}

export interface UseDataTableReturn<T extends { id: string }> {
    paginatedData: T[]
    selectedRows: Set<string>
    currentPage: number
    totalPages: number
    startIndex: number
    endIndex: number
    sortColumn: string | null
    sortDirection: 'asc' | 'desc'
    allSelected: boolean
    someSelected: boolean
    handleSelectAll: (checked: boolean) => void
    handleSelectRow: (id: string, checked: boolean) => void
    handleSort: (columnKey: string) => void
    setCurrentPage: (page: number) => void
    setSelectedRows: (rows: Set<string>) => void
}

/**
 * Hook for managing DataTable state and logic
 */
export function useDataTable<T extends { id: string }>(
    options: UseDataTableOptions<T>
): UseDataTableReturn<T> {
    const { data, pageSize } = options
    const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
    const [currentPage, setCurrentPage] = useState(1)
    const [sortColumn, setSortColumn] = useState<string | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

    // Calculate pagination
    const totalPages = Math.ceil(data.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    const paginatedData = useMemo(() => {
        const sorted = [...data]

        if (sortColumn) {
            sorted.sort((a, b) => {
                const aVal = a[sortColumn as keyof T]
                const bVal = b[sortColumn as keyof T]

                if (aVal === bVal) return 0
                const comparison = aVal < bVal ? -1 : 1
                return sortDirection === 'asc' ? comparison : -comparison
            })
        }

        return sorted.slice(startIndex, endIndex)
    }, [data, startIndex, endIndex, sortColumn, sortDirection])

    // Handle row selection
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(new Set(paginatedData.map((item) => item.id)))
        } else {
            setSelectedRows(new Set())
        }
    }

    const handleSelectRow = (id: string, checked: boolean) => {
        const newSelected = new Set(selectedRows)
        if (checked) {
            newSelected.add(id)
        } else {
            newSelected.delete(id)
        }
        setSelectedRows(newSelected)
    }

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(columnKey)
            setSortDirection('asc')
        }
    }

    const allSelected = paginatedData.length > 0 && selectedRows.size === paginatedData.length
    const someSelected = selectedRows.size > 0 && selectedRows.size < paginatedData.length

    return {
        paginatedData,
        selectedRows,
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        sortColumn,
        sortDirection,
        allSelected,
        someSelected,
        handleSelectAll,
        handleSelectRow,
        handleSort,
        setCurrentPage,
        setSelectedRows
    }
}






