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

