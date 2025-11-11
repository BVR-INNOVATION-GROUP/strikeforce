/**
 * ProjectsListSkeleton - Skeleton loader for projects list/board page
 */
import React from 'react'
import Skeleton from '@/src/components/core/Skeleton'

const ProjectsListSkeleton = () => {
  return (
    <div className="w-full flex flex-col h-full">
      {/* Header Skeleton */}
      <div className="flex w-full items-center bg-paper justify-between rounded-lg px-8 py-6 mb-4">
        <div className="flex items-center gap-3">
          <Skeleton width={80} height={24} rounded="md" />
          <Skeleton width={40} height={32} rounded="full" />
        </div>
        <Skeleton width={160} height={40} rounded="full" />
      </div>

      {/* Boards Skeleton */}
      <div className="flex sm:flex-row flex-col flex-1 gap-3 mt-4">
        {['In Progress', 'On Hold', 'Completed'].map((title, boardIndex) => (
          <div key={boardIndex} className="flex-1 bg-paper rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton width={100} height={20} rounded="md" />
              <Skeleton width={32} height={24} rounded="full" />
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg p-6 bg-pale">
                  <Skeleton width="90%" height={20} rounded="md" className="mb-3" />
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Skeleton width={60} height={24} rounded="full" />
                    <Skeleton width={80} height={24} rounded="full" />
                    <Skeleton width={70} height={24} rounded="full" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex -space-x-2">
                      <Skeleton width={32} height={32} rounded="full" />
                      <Skeleton width={32} height={32} rounded="full" />
                      <Skeleton width={32} height={32} rounded="full" />
                    </div>
                    <Skeleton width={100} height={18} rounded="md" />
                  </div>
                  <Skeleton width="100%" height={16} rounded="md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectsListSkeleton

