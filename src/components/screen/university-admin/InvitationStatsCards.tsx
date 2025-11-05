/**
 * Invitation Statistics Cards - displays pending/used/expired counts
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import { Clock, CheckCircle, X } from "lucide-react";
import { InvitationI, InvitationStatus } from "@/src/models/invitation";

export interface Props {
  invitations: InvitationI[];
}

/**
 * Display statistics cards for invitation counts
 */
const InvitationStatsCards = ({ invitations }: Props) => {
  const pendingInvitations = invitations.filter(
    (inv) => inv.status === "PENDING" && new Date(inv.expiresAt) >= new Date()
  );
  const usedInvitations = invitations.filter((inv) => inv.status === "USED");
  const expiredInvitations = invitations.filter(
    (inv) => inv.status === "EXPIRED" || new Date(inv.expiresAt) < new Date()
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <div className="flex items-center gap-3">
          <Clock size={24} className="text-warning" />
          <div>
            <p className="text-sm text-secondary">Pending</p>
            <p className="text-2xl font-bold">{pendingInvitations.length}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3">
          <CheckCircle size={24} className="text-success" />
          <div>
            <p className="text-sm text-secondary">Used</p>
            <p className="text-2xl font-bold">{usedInvitations.length}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3">
          <X size={24} className="text-error" />
          <div>
            <p className="text-sm text-secondary">Expired</p>
            <p className="text-2xl font-bold">{expiredInvitations.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvitationStatsCards;


