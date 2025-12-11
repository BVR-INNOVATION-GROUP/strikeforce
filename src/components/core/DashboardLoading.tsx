/**
 * Generic Dashboard Loading Component
 * Reusable loading skeleton for all dashboard pages
 * Prevents delayed redirects by showing loading state immediately
 */
"use client";

import React from "react";
import Card from "@/src/components/core/Card";
import Skeleton from "@/src/components/core/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="w-full flex flex-col min-h-full p-4 md:p-6 lg:p-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton width={300} height={32} rounded="md" className="mb-2" />
        <Skeleton width={400} height={20} rounded="md" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton width={40} height={40} rounded="md" />
              <Skeleton width={60} height={20} rounded="md" />
            </div>
            <Skeleton width={80} height={32} rounded="md" className="mb-2" />
            <Skeleton width={120} height={16} rounded="md" />
          </Card>
        ))}
      </div>

      {/* Main Content Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton width={200} height={24} rounded="md" />
              <Skeleton width={80} height={20} rounded="md" />
            </div>
            <Skeleton width="100%" height={200} rounded="lg" className="mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton width={40} height={40} rounded="full" />
                  <div className="flex-1">
                    <Skeleton width="70%" height={16} rounded="md" className="mb-2" />
                    <Skeleton width="50%" height={14} rounded="md" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Table/List Skeleton */}
      <Card className="p-6">
        <Skeleton width={250} height={24} rounded="md" className="mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-pale rounded-lg">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton width={48} height={48} rounded="md" />
                <div className="flex-1">
                  <Skeleton width="60%" height={18} rounded="md" className="mb-2" />
                  <Skeleton width="40%" height={14} rounded="md" />
                </div>
              </div>
              <Skeleton width={100} height={32} rounded="md" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

