/**
 * Dispute Card Component - displays dispute information in card format
 * Benchmarked from GroupCard.tsx
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/src/components/core/Button";
import StatusIndicator from "@/src/components/core/StatusIndicator";
import { DisputeI } from "@/src/models/dispute";
import { AlertCircle, Calendar, FileText } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";

export interface Props {
  dispute: DisputeI;
  onReview: (dispute: DisputeI) => void;
  onViewDetails?: (dispute: DisputeI) => void;
}

/**
 * Display a single dispute card with enhanced UI
 */
const DisputeCard = ({ dispute, onReview, onViewDetails }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails?.(dispute)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 bg-pale-primary rounded-lg">
            <AlertCircle size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-[1rem] font-[600] mb-2 capitalize">
              {dispute.subjectType.toLowerCase()}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <StatusIndicator status={dispute.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="mb-4">
        <p className="text-[0.875rem] font-medium mb-1">Reason</p>
        <p className="text-[0.8125rem] opacity-60">{dispute.reason}</p>
      </div>

      {/* Description */}
      {dispute.description && (
        <div className="mb-4">
          <p className="text-[0.8125rem] opacity-60 line-clamp-2">
            {dispute.description}
          </p>
        </div>
      )}

      {/* Level and Evidence */}
      <div className="mb-4 flex items-center gap-4 text-[0.8125rem] opacity-60">
        <div className="flex items-center gap-1">
          <span>Level:</span>
          <span className="capitalize">
            {dispute.level.replace("_", " ").toLowerCase()}
          </span>
        </div>
        {dispute.evidence && dispute.evidence.length > 0 && (
          <div className="flex items-center gap-1">
            <FileText size={14} />
            <span>{dispute.evidence.length} evidence file(s)</span>
          </div>
        )}
      </div>

      {/* Footer with date and actions */}
      <div className="space-y-3 pt-4 border-t border-custom">
        {/* Created date */}
        <div className="flex items-center gap-2 text-[0.75rem] opacity-50">
          <Calendar size={12} />
          <span>Created {formatDateShort(dispute.createdAt)}</span>
        </div>

        {/* Action button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onReview(dispute);
          }}
          className="bg-primary w-full text-[0.875rem] py-2.5"
        >
          Review
        </Button>
      </div>
    </motion.div>
  );
};

export default DisputeCard;

