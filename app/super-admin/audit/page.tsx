"use client";

import React, { useEffect, useState } from "react";
import Card from "@/src/components/core/Card";
import DataTable from "@/src/components/base/DataTable";
import { getAuditColumns, AuditEventI } from "@/src/utils/auditColumns";
import AuditStatsCards from "@/src/components/screen/super-admin/audit/AuditStatsCards";

/**
 * Super Admin Global Audit - view platform-wide audit logs and metrics
 */
export default function SuperAdminAudit() {
    const [events, setEvents] = useState<AuditEventI[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Mock audit events
                const sampleEvents: AuditEventI[] = [
                    {
                        id: "event-1",
                        type: "KYC_APPROVAL",
                        actor: "super-admin-1",
                        action: "APPROVED",
                        target: "org-partner-1",
                        timestamp: "2024-01-15T10:00:00Z",
                        details: "Partner organization KYC approved",
                    },
                    {
                        id: "event-2",
                        type: "MILESTONE_RELEASE",
                        actor: "user-partner-1",
                        action: "RELEASED",
                        target: "milestone-1",
                        timestamp: "2024-02-15T10:00:00Z",
                        details: "Escrow released for milestone completion",
                    },
                    {
                        id: "event-3",
                        type: "DISPUTE_ESCALATION",
                        actor: "user-student-1",
                        action: "ESCALATED",
                        target: "dispute-1",
                        timestamp: "2024-02-16T10:00:00Z",
                        details: "Dispute escalated to Super Admin",
                    },
                ];
                setEvents(sampleEvents);
            } catch (error) {
                console.error("Failed to load audit events:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const columns = getAuditColumns();
    const stats = {
        totalEvents: events.length,
        kycEvents: events.filter((e) => e.type.includes("KYC")).length,
        financialEvents: events.filter((e) => e.type.includes("MILESTONE") || e.type.includes("PAYOUT")).length,
        disputeEvents: events.filter((e) => e.type.includes("DISPUTE")).length,
    };

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2">Global Audit</h1>
                <p className="text-gray-600">Platform-wide audit logs and activity tracking</p>
            </div>

            {/* Statistics */}
            <AuditStatsCards stats={stats} />

            {/* Audit Events Table */}
            <Card title="Audit Log">
                <DataTable
                    data={events}
                    columns={columns}
                    emptyMessage="No audit events"
                />
            </Card>
        </div>
    );
}

