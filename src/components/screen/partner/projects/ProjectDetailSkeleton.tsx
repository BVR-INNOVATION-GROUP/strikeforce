/**
 * ProjectDetailSkeleton - Skeleton loader for project detail page
 */
import React from 'react'
import Card from '@/src/components/core/Card'
import Skeleton from '@/src/components/core/Skeleton'

const ProjectDetailSkeleton = () => {
  return (
    <div className="w-full flex flex-col h-full overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex-shrink-0 mb-8">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <Skeleton width={400} height={32} rounded="lg" className="mb-3" />
            <div className="flex items-center gap-3">
              <Skeleton width={100} height={24} rounded="full" />
              <Skeleton width={200} height={20} rounded="md" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Content Column Skeleton */}
        <div className="lg:col-span-2 flex flex-col gap-6 h-full overflow-y-auto pr-2">
          {/* Overview Card */}
          <Card title="Project Overview">
            <div className="space-y-3">
              <Skeleton width="100%" height={16} rounded="md" />
              <Skeleton width="100%" height={16} rounded="md" />
              <Skeleton width="80%" height={16} rounded="md" />
            </div>
          </Card>

          {/* Skills Card */}
          <Card title="Required Skills">
            <div className="flex flex-wrap gap-3">
              <Skeleton width={120} height={32} rounded="full" />
              <Skeleton width={100} height={32} rounded="full" />
              <Skeleton width={110} height={32} rounded="full" />
              <Skeleton width={90} height={32} rounded="full" />
            </div>
          </Card>

          {/* Applications Card */}
          <Card title="Applications">
            <div className="flex flex-col gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-lg p-6 bg-pale">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Skeleton width={180} height={20} rounded="md" className="mb-2" />
                      <div className="flex items-center gap-3">
                        <Skeleton width={80} height={20} rounded="full" />
                        <Skeleton width={140} height={16} rounded="md" />
                      </div>
                    </div>
                    <Skeleton width={100} height={16} rounded="md" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton width={16} height={16} rounded="full" />
                    <div className="flex -space-x-2">
                      <Skeleton width={32} height={32} rounded="full" />
                      <Skeleton width={32} height={32} rounded="full" />
                    </div>
                    <Skeleton width={80} height={16} rounded="md" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton width={100} height={36} rounded="lg" />
                    <Skeleton width={100} height={36} rounded="lg" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Milestones Card */}
          <Card title="Project Milestones">
            <div className="flex flex-col gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-lg p-6 bg-pale">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Skeleton width={200} height={20} rounded="md" className="mb-2" />
                      <Skeleton width={150} height={16} rounded="md" />
                    </div>
                    <Skeleton width={100} height={24} rounded="full" />
                  </div>
                  <Skeleton width="100%" height={10} rounded="full" className="mb-2" />
                  <Skeleton width={120} height={36} rounded="lg" />
                </div>
              ))}
            </div>
          </Card>

          {/* Chat Section Skeleton */}
          <Card title="Recent Messages">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg p-6 bg-pale">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton width={40} height={40} rounded="full" />
                    <div className="flex-1">
                      <Skeleton width={120} height={16} rounded="md" className="mb-2" />
                      <Skeleton width={80} height={14} rounded="md" />
                    </div>
                  </div>
                  <Skeleton width="90%" height={16} rounded="md" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Column Skeleton */}
        <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
          {/* Project Details Card */}
          <Card title="Project Details">
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton width={20} height={20} rounded="md" />
                  <div className="flex-1">
                    <Skeleton width={100} height={14} rounded="md" className="mb-2" />
                    <Skeleton width={150} height={18} rounded="md" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* University Info Card */}
          <Card title="University Information">
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton width={20} height={20} rounded="md" />
                  <Skeleton width={180} height={18} rounded="md" />
                </div>
              ))}
            </div>
          </Card>

          {/* Team Members Card */}
          <Card title="Assigned Team">
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative">
                    <Skeleton width={40} height={40} rounded="full" />
                    <Skeleton width={14} height={14} rounded="full" className="absolute -bottom-1 -right-1 border-2 border-paper" />
                  </div>
                  <div className="flex-1">
                    <Skeleton width={140} height={16} rounded="md" className="mb-2" />
                    <Skeleton width={100} height={14} rounded="md" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions Card */}
          <Card title="Quick Actions">
            <div className="flex flex-col gap-3">
              <Skeleton width="100%" height={40} rounded="lg" />
              <Skeleton width="100%" height={40} rounded="lg" />
              <Skeleton width="100%" height={40} rounded="lg" />
              <Skeleton width="100%" height={40} rounded="lg" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailSkeleton

