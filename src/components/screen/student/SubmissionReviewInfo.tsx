/**
 * Submission Review Info Component
 */
"use client";

import React from "react";

/**
 * Display review process information for milestone submission
 */
const SubmissionReviewInfo = () => {
  return (
    <div className="text-sm text-secondary bg-yellow-50 p-3 rounded-lg border border-yellow-200">
      <p className="font-semibold mb-1 text-warning-dark">Review Process:</p>
      <ul className="list-disc list-inside space-y-1 text-xs text-warning-dark">
        <li>Your submission will first be reviewed by the supervisor</li>
        <li>Supervisor will approve or request changes</li>
        <li>Once approved by supervisor, partner reviews and releases payment</li>
        <li>You'll be notified at each step</li>
      </ul>
    </div>
  );
};

export default SubmissionReviewInfo;






