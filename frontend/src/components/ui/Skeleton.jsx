import React from 'react'

const Skeleton = ({ className = '' }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
)

export const ProductCardSkeleton = () => (
  <div className="rounded-lg overflow-hidden">
    <Skeleton className="aspect-[3/4] w-full" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
)

export default Skeleton
