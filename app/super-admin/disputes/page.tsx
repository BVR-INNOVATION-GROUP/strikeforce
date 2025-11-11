"use client";

import React, { useState } from "react";
import Card from "@/src/components/core/Card";
import StatCard from "@/src/components/core/StatCard";
import DataTable from "@/src/components/base/DataTable";
import DisputeResolutionModal from "@/src/components/screen/super-admin/disputes/DisputeResolutionModal";
import { getDisputeColumns } from "@/src/components/screen/super-admin/disputes/DisputeTableColumns";
import { useDisputes } from "@/src/hooks/useDisputes";
import { DisputeI } from "@/src/models/dispute";
import { AlertCircle, CheckCircle } from "lucide-react";

/**
 * Super Admin Dispute Arbitration - final dispute resolution
 */
export default function SuperAdminDisputes() {
    const { escalatedDisputes, resolvedDisputes, loading, resolveDispute } = useDisputes();
    const [selectedDispute, setSelectedDispute] = useState<DisputeI | null>(null);
    const [resolution, setResolution] = useState("");
    const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);

    const handleResolve = (dispute: DisputeI) => {
        setSelectedDispute(dispute);
        setIsResolutionModalOpen(true);
    };

    const handleSubmitResolution = () => {
        if (!selectedDispute) return;

        resolveDispute(selectedDispute.id, resolution);
        setIsResolutionModalOpen(false);
        setSelectedDispute(null);
        setResolution("");
    };

    const columns = getDisputeColumns(handleResolve);

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2">Dispute Arbitration</h1>
                <p className="text-gray-600">Final resolution for escalated disputes</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard
                    icon={<AlertCircle size={20} />}
                    title="Escalated Disputes"
                    value={escalatedDisputes.length}
                />
                <StatCard
                    icon={<CheckCircle size={20} />}
                    title="Resolved"
                    value={resolvedDisputes.length}
                />
            </div>

            {/* Disputes Table */}
            <Card title="Escalated Disputes">
                <DataTable
                    data={escalatedDisputes}
                    columns={columns}
                    emptyMessage="No escalated disputes"
                />
            </Card>

            <DisputeResolutionModal
                open={isResolutionModalOpen}
                dispute={selectedDispute}
                resolution={resolution}
                onClose={() => setIsResolutionModalOpen(false)}
                onResolutionChange={setResolution}
                onSubmit={handleSubmitResolution}
            />
        </div>
    );
}

