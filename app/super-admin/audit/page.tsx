"use client";

import React, { useEffect, useState } from "react";
import Card from "@/src/components/core/Card";
import DataTable from "@/src/components/base/DataTable";
import { getAuditColumns, AuditEventI } from "@/src/utils/auditColumns";
import AuditStatsCards from "@/src/components/screen/super-admin/audit/AuditStatsCards";
import { auditRepository } from "@/src/repositories/auditRepository";
import { useToast } from "@/src/hooks/useToast";
import DashboardLoading from "@/src/components/core/DashboardLoading";

/**
 * Super Admin Global Audit - view platform-wide audit logs and metrics
 * Uses auditRepository for data access (supports mock and real API)
 */
export default function SuperAdminAudit() {
    const { showError } = useToast();
    const [events, setEvents] = useState<AuditEventI[]>([]);
    const [loading, setLoading] = useState(true);

    /**
     * Fetch audit events from repository
     */
    const fetchEvents = async () => {
        try {
            setLoading(true);
            const auditEvents = await auditRepository.getAll();
            setEvents(auditEvents);
        } catch (error) {
            console.error("Failed to load audit events:", error);
            showError("Failed to load audit events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = getAuditColumns();
    const stats = {
        totalEvents: events.length,
        kycEvents: events.filter((e) => e.type.includes("KYC")).length,
        financialEvents: events.filter((e) => e.type.includes("MILESTONE") || e.type.includes("PAYOUT")).length,
        disputeEvents: events.filter((e) => e.type.includes("DISPUTE")).length,
    };

    if (loading) {
        return <DashboardLoading />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-2">Global Audit</h1>
                <p className="text-secondary">Platform-wide audit logs and activity tracking</p>
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

