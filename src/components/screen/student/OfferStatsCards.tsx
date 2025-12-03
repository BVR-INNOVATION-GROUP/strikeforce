/**
 * Offer Statistics Cards
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { ApplicationI } from "@/src/models/application";

export interface Props {
  applications: ApplicationI[];
}

/**
 * Display statistics cards for offers
 */
const OfferStatsCards = ({ applications }: Props) => {
  const activeOffers = applications.filter(
    (a) =>
      a.status === "OFFERED" &&
      (!a.offerExpiresAt || new Date(a.offerExpiresAt) >= new Date())
  );
  const expiredOffers = applications.filter(
    (a) => a.offerExpiresAt && new Date(a.offerExpiresAt) < new Date()
  );
  const acceptedOffers = applications.filter(
    (a) => a.status === "ASSIGNED" || a.status === "ACCEPTED"
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <div className="flex items-center gap-3">
          <Clock size={24} className="text-warning" />
          <div>
            <p className="text-sm text-secondary">Active Offers</p>
            <p className="text-2xl font-bold">{activeOffers.length}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3">
          <CheckCircle size={24} className="text-success" />
          <div>
            <p className="text-sm text-secondary">Accepted</p>
            <p className="text-2xl font-bold">{acceptedOffers.length}</p>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex items-center gap-3">
          <AlertCircle size={24} className="text-error" />
          <div>
            <p className="text-sm text-secondary">Expired</p>
            <p className="text-2xl font-bold">{expiredOffers.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OfferStatsCards;


