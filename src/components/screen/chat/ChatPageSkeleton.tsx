/**
 * ChatPageSkeleton - Skeleton loader for chat page
 */
import React from 'react'
import Card from '@/src/components/core/Card'
import Skeleton from '@/src/components/core/Skeleton'

const ChatPageSkeleton = () => {
  return (
    <div className="w-full flex flex-col gap-8 h-full overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <Skeleton width={200} height={32} rounded="lg" />
          <Skeleton width={120} height={20} rounded="md" />
        </div>
        <Skeleton width={300} height={16} rounded="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Threads List Skeleton */}
        <Card title="Conversations">
          <div className="flex flex-col gap-3 h-full overflow-y-auto">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-lg p-6 bg-pale">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton width={48} height={48} rounded="full" />
                  <div className="flex-1">
                    <Skeleton width={150} height={18} rounded="md" className="mb-2" />
                    <Skeleton width={100} height={14} rounded="md" />
                  </div>
                </div>
                <Skeleton width="100%" height={14} rounded="md" />
              </div>
            ))}
          </div>
        </Card>

        {/* Messages View Skeleton */}
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          <Card>
            <div className="flex flex-col h-full">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton width={40} height={40} rounded="full" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Skeleton width={120} height={16} rounded="md" />
                        <Skeleton width={100} height={14} rounded="md" />
                      </div>
                      <div className="rounded-lg p-6 bg-pale">
                        <Skeleton width="90%" height={16} rounded="md" className="mb-2" />
                        <Skeleton width="70%" height={16} rounded="md" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-pale flex-shrink-0">
                <div className="flex gap-3">
                  <Skeleton width="100%" height={40} rounded="lg" />
                  <Skeleton width={40} height={40} rounded="lg" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ChatPageSkeleton

