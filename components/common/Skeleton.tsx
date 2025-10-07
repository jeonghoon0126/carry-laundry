import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg bg-gray-200 skeleton-shimmer skeleton-fade-in",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Skeleton.displayName = "Skeleton"

// 특정 용도의 스켈레톤 컴포넌트들
export const SkeletonText = ({ lines = 1, className }: { lines?: number; className?: string }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i}
        className={cn(
          "h-4",
          i === lines - 1 ? "w-3/4" : "w-full"
        )}
      />
    ))}
  </div>
)

export const SkeletonAvatar = ({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }
  
  return (
    <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
  )
}

export const SkeletonButton = ({ className }: { className?: string }) => (
  <Skeleton className={cn("h-10 w-24", className)} />
)

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("rounded-2xl border border-gray-200 bg-white p-4 space-y-4", className)}>
    <div className="flex items-center space-x-3">
      <SkeletonAvatar size="sm" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-20" />
      <SkeletonButton />
    </div>
  </div>
)

export const SkeletonOrderCard = ({ className }: { className?: string }) => (
  <div className={cn("rounded-2xl border border-gray-200 bg-white p-4 space-y-4", className)}>
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
)

export const SkeletonAddressCard = ({ className }: { className?: string }) => (
  <div className={cn("rounded-2xl border border-gray-200 bg-white p-4 space-y-4", className)}>
    <div className="flex justify-between items-center">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-6 w-12" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <Skeleton className="h-10 w-full" />
  </div>
)

export const SkeletonCheckoutSheet = ({ className }: { className?: string }) => (
  <div className={cn("space-y-4", className)}>
    <SkeletonCard />
    <SkeletonAddressCard />
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </div>
    </div>
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
)

export default Skeleton