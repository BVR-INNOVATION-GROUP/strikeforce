/**
 * Course Card Component - displays course information in card format
 * Benchmarked from GroupCard.tsx
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/src/components/core/Button";
import { CourseI } from "@/src/models/project";
import { DepartmentI } from "@/src/models/project";
import { Edit, Trash2, BookOpen } from "lucide-react";

export interface Props {
  course: CourseI;
  department: DepartmentI | undefined;
  onEdit: (course: CourseI) => void;
  onDelete: (courseId: string) => void;
  onViewDetails?: (course: CourseI) => void;
}

/**
 * Display a single course card with enhanced UI
 */
const CourseCard = ({ course, department, onEdit, onDelete, onViewDetails }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetails?.(course)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-3 bg-pale-primary rounded-lg">
            <BookOpen size={20} className="text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-[1rem] font-[600] mb-1">{course.name}</h3>
            <p className="text-[0.8125rem] opacity-60">
              {department?.name || "Unknown Department"}
            </p>
          </div>
        </div>
      </div>


      {/* Footer with actions */}
      <div className="space-y-3 pt-4 border-t border-custom">
        {/* Action buttons */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(course);
            }}
            className="bg-pale text-primary flex-1 text-[0.875rem] py-2.5"
            type="button"
          >
            <Edit size={14} className="mr-1" />
            Edit
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(String(course.id));
            }}
            className="bg-primary text-[0.875rem] py-2.5 flex-1"
            type="button"
          >
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;

