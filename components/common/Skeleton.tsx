import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  h?: string
  w?: string
  className?: string
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ h, w, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-[var(--radius)] bg-[#1a2141]/60",
          h && `h-${h}`,
          w && `w-${w}`,
          className
        )}
      />
    )
  }
)

Skeleton.displayName = "Skeleton"

export default Skeleton