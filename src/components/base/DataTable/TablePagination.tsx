/**
 * TablePagination component for DataTable
 */
import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface Props {
    currentPage: number
    totalPages: number
    startIndex: number
    endIndex: number
    totalItems: number
    onPageChange: (page: number) => void
}

function TablePagination(props: Props) {
    const { currentPage, totalPages, startIndex, endIndex, totalItems, onPageChange } = props

    /**
     * Generate page number buttons to display
     * Shows up to 5 pages with ellipsis when needed
     */
    const getPageNumbers = () => {
        const pages: number[] = []
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 5; i++) {
                pages.push(i)
            }
        } else if (currentPage >= totalPages - 2) {
            for (let i = totalPages - 4; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                pages.push(i)
            }
        }
        return pages
    }

    const pageNumbers = getPageNumbers()
    const showFirstPage = totalPages > 5 && currentPage > 3
    const showLastPage = totalPages > 5 && currentPage < totalPages - 2
    const showFirstEllipsis = totalPages > 5 && currentPage > 4
    const showLastEllipsis = totalPages > 5 && currentPage < totalPages - 3

    return (
        <div className="border-t border-custom bg-white px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-secondary">
                Showing {totalItems === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, totalItems)} of{' '}
                {totalItems} entries
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded text-sm border border-custom ${currentPage === 1
                        ? 'text-muted-light cursor-not-allowed'
                        : 'text-secondary hover:bg-pale'
                        }`}
                >
                    <div className="flex items-center gap-1">
                        <ChevronLeft size={14} />
                        <span>Previous</span>
                    </div>
                </button>

                <div className="flex items-center gap-1">
                    {showFirstPage && (
                        <>
                            <button
                                onClick={() => onPageChange(1)}
                                className="px-3 py-1 rounded text-sm border border-custom text-secondary hover:bg-pale"
                            >
                                1
                            </button>
                            {showFirstEllipsis && <span className="px-2 text-muted-light">...</span>}
                        </>
                    )}

                    {pageNumbers.map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`px-3 py-1 rounded text-sm border border-custom ${currentPage === pageNum
                                ? 'bg-primary text-white border-primary'
                                : 'text-secondary hover:bg-pale'
                                }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    {showLastPage && (
                        <>
                            {showLastEllipsis && <span className="px-2 text-muted-light">...</span>}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="px-3 py-1 rounded text-sm border border-custom text-secondary hover:bg-pale"
                            >
                                {totalPages}
                            </button>
                        </>
                    )}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded text-sm border border-custom ${currentPage === totalPages
                        ? 'text-muted-light cursor-not-allowed'
                        : 'text-secondary hover:bg-pale'
                        }`}
                >
                    <div className="flex items-center gap-1">
                        <span>Next</span>
                        <ChevronRight size={14} />
                    </div>
                </button>
            </div>
        </div>
    )
}

export default TablePagination






