"use client";

import React, { ReactNode } from "react";
import TableHeader from "./DataTable/TableHeader";
import TableBody from "./DataTable/TableBody";
import BulkActionsBar from "./DataTable/BulkActionsBar";
import TablePagination from "./DataTable/TablePagination";
import { useDataTable } from "@/src/hooks/useDataTable";

export interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => ReactNode;
    sortable?: boolean;
}

export interface Props<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    pageSize?: number;
    onBulkAction?: (action: string, selectedIds: string[]) => void;
    showActions?: boolean; // Show edit/delete/more actions column
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
}

/**
 * DataTable component - matches UI benchmark with selection, pagination, and floating action bar
 * All borders use border-custom color
 */
function DataTable<T extends { id: string }>({
    data,
    columns,
    onRowClick,
    emptyMessage: _emptyMessage = "No data available",
    pageSize = 10,
    onBulkAction,
    showActions = false,
    onEdit,
    onDelete,
}: Props<T>) {
    const {
        paginatedData,
        selectedRows,
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        sortColumn,
        sortDirection,
        allSelected,
        handleSelectAll,
        handleSelectRow,
        handleSort,
        setCurrentPage,
        setSelectedRows
    } = useDataTable({ data, pageSize });

    const handleBulkAction = (action: string) => {
        if (onBulkAction) {
            onBulkAction(action, Array.from(selectedRows));
        }
        setSelectedRows(new Set());
    };

    return (
        <div className="bg-paper rounded-lg  overflow-hidden relative">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <TableHeader
                        columns={columns}
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        allSelected={allSelected}
                        showActions={showActions}
                        onSelectAll={handleSelectAll}
                        onSort={handleSort}
                    />
                    <TableBody
                        data={paginatedData}
                        columns={columns}
                        selectedRows={selectedRows}
                        showActions={showActions}
                        onRowClick={onRowClick}
                        onSelectRow={handleSelectRow}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                </table>
            </div>

            {selectedRows.size > 0 && onBulkAction && (
                <BulkActionsBar
                    selectedCount={selectedRows.size}
                    onBulkAction={handleBulkAction}
                    onClearSelection={() => setSelectedRows(new Set())}
                />
            )}

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                startIndex={startIndex}
                endIndex={endIndex}
                totalItems={data.length}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}

export default DataTable;
