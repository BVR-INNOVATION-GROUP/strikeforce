/**
 * Requests Empty State Component
 * Enhanced with better styling and animations
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

/**
 * Display empty state when no supervisor requests exist
 */
const RequestsEmptyState = () => {
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
        You haven't made any supervisor requests yet. Request a supervisor from the project details page.
      </p>
    </motion.div>
  );
};

export default RequestsEmptyState;





