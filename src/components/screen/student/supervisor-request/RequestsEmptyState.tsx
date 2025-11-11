/**
 * Requests Empty State Component
 * Enhanced with better styling and animations
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "@/src/components/core/Button";
import { UserPlus, Users } from "lucide-react";

export interface Props {
  onCreateRequest: () => void;
}

/**
 * Display empty state when no supervisor requests exist
 * Provides clear call-to-action for creating first request
 */
const RequestsEmptyState = ({ onCreateRequest }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-paper rounded-lg p-12 shadow-custom text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <Users size={64} className="mx-auto mb-6 opacity-30" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">No supervisor requests yet</h3>
      <p className="text-[0.875rem] opacity-60 mb-6 max-w-md mx-auto">
        Request a supervisor to get guidance and support for your project
      </p>
      <Button onClick={onCreateRequest} className="bg-primary">
        <UserPlus size={16} className="mr-2" />
        Create Your First Request
      </Button>
    </motion.div>
  );
};

export default RequestsEmptyState;




