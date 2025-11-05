/**
 * Department Card Component - displays department information in card format
 * Benchmarked from GroupCard.tsx
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/src/components/core/Button";
import { DepartmentI } from "@/src/models/project";
import { Edit, Trash2, Calendar, Building2 } from "lucide-react";
import { formatDateShort } from "@/src/utils/dateFormatters";

export interface Props {
  department: DepartmentI;
  onEdit: (department: DepartmentI) => void;
  onDelete: (departmentId: string) => void;
  onViewDetails?: (department: DepartmentI) => void;
}

/**
 * Display a single department card with enhanced UI
 */
const DepartmentCard = ({ department, onEdit, onDelete, onViewDetails }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails?.(department)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 bg-pale-primary rounded-lg">
            <Building2 size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-[1rem] font-[600] mb-1">{department.name}</h3>
            <p className="text-[0.8125rem] opacity-60">Department</p>
          </div>
        </div>
      </div>

      {/* Footer with date and actions */}
      <div className="space-y-3 pt-4 border-t border-custom">
        {/* Created date */}
        <div className="flex items-center gap-2 text-[0.75rem] opacity-50">
          <Calendar size={12} />
          <span>Created {formatDateShort(department.createdAt)}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={() => onEdit(department)}
            className="bg-pale text-primary flex-1 text-[0.875rem] py-2.5"
          >
            <Edit size={14} className="mr-1" />
            Edit
          </Button>
          <Button
            onClick={() => onDelete(department.id)}
            className="bg-primary text-[0.875rem] py-2.5 flex-1"
          >
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DepartmentCard;

