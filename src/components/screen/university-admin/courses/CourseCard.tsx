/**
 * Course Card Component - displays course information in card format
 * Benchmarked from DepartmentCard.tsx
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { CourseI } from "@/src/models/project";
import { BookOpen, Edit, Trash2 } from "lucide-react";
import Button from "@/src/components/core/Button";

export interface Props {
  course: CourseI;
  studentCount?: number;
  onEdit: (course: CourseI) => void;
  onDelete: (courseId: string | number) => void;
  onSelect?: (course: CourseI) => void;
}

/**
 * Display a single course card with enhanced UI
 */
const CourseCard = ({ course, studentCount, onEdit, onDelete, onSelect }: Props) => {
  const handleClick = () => {
    if (!course || course.id === undefined || course.id === null) {
      console.error("CourseCard: Invalid course data", course);
      return;
    }
    onSelect?.(course);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-paper rounded-lg p-6 shadow-custom hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={handleClick}>
        <div className="p-3 bg-pale-primary rounded-lg">
          <BookOpen size={20} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[0.875rem] text-muted uppercase tracking-wide">Programme</p>
          <h3 className="text-[1rem] font-[600] truncate">{course.name}</h3>
          {studentCount !== undefined && (
            <p className="text-[0.75rem] text-muted mt-1">
              {studentCount} {studentCount === 1 ? "student" : "students"}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Button
          onClick={() => onEdit(course)}
          className="bg-pale text-primary flex-1 text-[0.875rem] py-2.5"
        >
          <Edit size={14} className="mr-1" />
          Edit
        </Button>
        <Button
          onClick={() => {
            const id = course.id;
            if (!id && id !== 0) {
              console.error("Course ID is missing");
              return;
            }
            onDelete(typeof id === "number" ? id : id.toString());
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

export default CourseCard;

