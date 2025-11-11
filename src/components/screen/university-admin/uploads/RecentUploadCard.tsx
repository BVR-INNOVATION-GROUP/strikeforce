/**
 * Recent Upload Card Component - displays recent upload information in card format
 * Benchmarked from GroupCard.tsx
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, Building2, BookOpen, UserCheck, Calendar } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";

export interface RecentUploadI {
  id: string;
  name: string;
  email?: string;
  department?: string;
  course?: string;
  type: "student" | "supervisor" | "department" | "course";
  uploadedAt: string;
}

export interface Props {
  upload: RecentUploadI;
}

/**
 * Display a single recent upload card
 */
const RecentUploadCard = ({ upload }: Props) => {
  const getIcon = () => {
    switch (upload.type) {
      case "student":
        return <User size={20} className="text-primary" />;
      case "supervisor":
        return <UserCheck size={20} className="text-primary" />;
      case "department":
        return <Building2 size={20} className="text-primary" />;
      case "course":
        return <BookOpen size={20} className="text-primary" />;
    }
  };

  const getTypeLabel = () => {
    return upload.type.charAt(0).toUpperCase() + upload.type.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 bg-pale-primary rounded-lg">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-[1rem] font-[600] mb-1">{upload.name}</h3>
            <p className="text-[0.8125rem] opacity-60">{getTypeLabel()}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mb-4 space-y-2">
        {upload.email && (
          <div className="text-[0.8125rem] opacity-60">
            <span className="font-medium">Email:</span> {upload.email}
          </div>
        )}
        {upload.department && (
          <div className="text-[0.8125rem] opacity-60">
            <span className="font-medium">Department:</span> {upload.department}
          </div>
        )}
        {upload.course && (
          <div className="text-[0.8125rem] opacity-60">
            <span className="font-medium">Course:</span> {upload.course}
          </div>
        )}
      </div>

      {/* Footer with date */}
      <div className="pt-4 border-t border-custom">
        <div className="flex items-center gap-2 text-[0.75rem] opacity-50">
          <Calendar size={12} />
          <span>Uploaded {formatDateShort(upload.uploadedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default RecentUploadCard;




