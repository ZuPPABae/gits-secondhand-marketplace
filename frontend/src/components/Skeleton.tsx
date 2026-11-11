import React from 'react'

export interface SkeletonProps {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-zinc-200/70 rounded-md ${className}`}
      aria-hidden="true"
    />
  )
}

export const ListingCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden p-3 flex flex-col">
      <Skeleton className="w-full aspect-[4/3] rounded-lg mb-3" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-6 w-1/2 rounded" />
        <div className="pt-2 flex items-center justify-between">
          <Skeleton className="h-4 w-1/3 rounded" />
          <Skeleton className="h-4 w-1/4 rounded" />
        </div>
      </div>
    </div>
  )
}

export const ListingRowSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
      <Skeleton className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-5 w-1/3 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
      </div>
      <Skeleton className="hidden sm:block h-4 w-20 rounded flex-shrink-0" />
    </div>
  )
}

