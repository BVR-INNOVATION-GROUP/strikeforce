/**
 * Organization Details Side Modal
 * Shows detailed information about an organization
 */
"use client";

import React from "react";
import SideModal from "@/src/components/base/SideModal";
import { OrganizationI } from "@/src/models/organization";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { Building2, GraduationCap, Mail, Globe, Phone, MapPin, Calendar, FileText } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";

export interface Props {
  open: boolean;
  onClose: () => void;
  organization: OrganizationI | null;
}

/**
 * Display detailed organization information in a side modal
 */
const OrganizationDetailsModal = ({ open, onClose, organization }: Props) => {
  if (!organization) return null;

  const isPartner = organization.type === "PARTNER";

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title={organization.name}
      width="600px"
    >
      <div className="space-y-6">
        {/* Organization Type and Status */}
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${isPartner ? "bg-primary/10" : "bg-blue-100"}`}>
            {isPartner ? (
              <Building2 size={32} className="text-primary" />
            ) : (
              <GraduationCap size={32} className="text-blue-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusIndicator
                status={organization.type.toLowerCase()}
                label={organization.type}
              />
              <StatusIndicator status={organization.kycStatus} />
            </div>
            <p className="text-[0.875rem] opacity-60">Organization ID: {organization.id}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="text-[0.9375rem] font-[600]">Contact Information</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-pale rounded-lg">
              <Mail size={16} className="opacity-60" />
              <div>
                <p className="text-[0.75rem] opacity-60 mb-1">Email</p>
                <p className="text-[0.875rem]">{organization.email}</p>
              </div>
            </div>
            {organization.billingProfile?.contactName && (
              <div className="flex items-center gap-3 p-3 bg-pale rounded-lg">
                <FileText size={16} className="opacity-60" />
                <div>
                  <p className="text-[0.75rem] opacity-60 mb-1">Contact Name</p>
                  <p className="text-[0.875rem]">{organization.billingProfile.contactName}</p>
                </div>
              </div>
            )}
            {organization.billingProfile?.phone && (
              <div className="flex items-center gap-3 p-3 bg-pale rounded-lg">
                <Phone size={16} className="opacity-60" />
                <div>
                  <p className="text-[0.75rem] opacity-60 mb-1">Phone</p>
                  <p className="text-[0.875rem]">{organization.billingProfile.phone}</p>
                </div>
              </div>
            )}
            {organization.billingProfile?.website && (
              <div className="flex items-center gap-3 p-3 bg-pale rounded-lg">
                <Globe size={16} className="opacity-60" />
                <div>
                  <p className="text-[0.75rem] opacity-60 mb-1">Website</p>
                  <a
                    href={organization.billingProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.875rem] text-primary hover:underline"
                  >
                    {organization.billingProfile.website}
                  </a>
                </div>
              </div>
            )}
            {organization.billingProfile?.address && (
              <div className="flex items-center gap-3 p-3 bg-pale rounded-lg">
                <MapPin size={16} className="opacity-60" />
                <div>
                  <p className="text-[0.75rem] opacity-60 mb-1">Address</p>
                  <p className="text-[0.875rem]">{organization.billingProfile.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-3">
          <h4 className="text-[0.9375rem] font-[600]">Timeline</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-pale rounded-lg">
              <Calendar size={16} className="opacity-60" />
              <div>
                <p className="text-[0.75rem] opacity-60 mb-1">Created</p>
                <p className="text-[0.875rem]">{formatDateShort(organization.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-pale rounded-lg">
              <Calendar size={16} className="opacity-60" />
              <div>
                <p className="text-[0.75rem] opacity-60 mb-1">Last Updated</p>
                <p className="text-[0.875rem]">{formatDateShort(organization.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        {organization.billingProfile?.paymentMethods && 
         organization.billingProfile.paymentMethods.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[0.9375rem] font-[600]">Payment Methods</h4>
            <div className="space-y-2">
              {organization.billingProfile.paymentMethods.map((method, index) => (
                <div key={index} className="p-3 bg-pale rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[0.875rem] font-medium capitalize">
                      {method.type.replace(/_/g, " ")}
                    </p>
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-[0.75rem]">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SideModal>
  );
};

export default OrganizationDetailsModal;

