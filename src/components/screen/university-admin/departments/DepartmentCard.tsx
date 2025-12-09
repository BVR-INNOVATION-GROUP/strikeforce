/**
 * Department Card Component - displays department information in card format
 * Benchmarked from GroupCard.tsx
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { DepartmentI } from "@/src/models/project";
import { Building2, Edit, Trash2 } from "lucide-react";
import Button from "@/src/components/core/Button";

export interface Props {
  department: DepartmentI;
  programmeCount?: number;
  statCount?: number;
  statLabel?: string;
  onEdit: (department: DepartmentI) => void;
  onDelete: (departmentId: string) => void;
  onSelect?: (department: DepartmentI) => void;
}

const DepartmentCard = ({
  department,
  programmeCount,
  statCount,
  statLabel = "programme",
  onEdit,
  onDelete,
  onSelect,
}: Props) => {
  const resolvedCount = statCount ?? programmeCount;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => onSelect?.(department)}>
        <div className="p-3 bg-pale-primary rounded-lg">
          <Building2 size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.875rem] text-muted uppercase tracking-wide">Department</p>
          <h3 className="text-[1rem] font-[600] truncate">{department.name}</h3>
          {department.collegeName && (
            <p className="text-[0.75rem] text-muted mt-0.5 truncate">
              College: {department.collegeName}
            </p>
          )}
          {resolvedCount !== undefined && (
            <p className="text-[0.75rem] text-muted mt-1">
              {resolvedCount} {resolvedCount === 1 ? statLabel : `${statLabel}s`}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Button
          onClick={() => onEdit(department)}
          className="bg-pale text-primary flex-1 text-[0.875rem] py-2.5"
        >
          <Edit size={14} className="mr-1" />
          Edit
        </Button>
        <Button
          onClick={() => {
            const id = department.id;
            if (!id) {
              console.error("Department ID is missing");
              return;
            }
            onDelete(typeof id === "number" ? id.toString() : id);
          }}
          className="bg-primary text-[0.875rem] py-2.5 flex-1"
        >
          <Trash2 size={14} className="mr-1" />
          Delete
        </Button>
      </div>
    </motion.div>
  );
};

export default DepartmentCard;

