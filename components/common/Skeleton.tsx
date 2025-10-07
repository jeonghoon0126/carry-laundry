import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200",
          className
        )}
        animate={{
          background: [
            "linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 20%, #f3f4f6 40%, #f3f4f6 100%)",
            "linear-gradient(90deg, #f3f4f6 0%, #f3f4f6 20%, #e5e7eb 40%, #f3f4f6 100%)",
            "linear-gradient(90deg, #f3f4f6 0%, #f3f4f6 20%, #f3f4f6 40%, #e5e7eb 100%)",
            "linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 20%, #f3f4f6 40%, #f3f4f6 100%)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        {...props}
      >
        {/* 추가적인 그래픽 효과 */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.5
          }}
        />
        {children}
      </motion.div>
    )
  }
)

Skeleton.displayName = "Skeleton"

// 특정 용도의 스켈레톤 컴포넌트들
export const SkeletonText = ({ lines = 1, className }: { lines?: number; className?: string }) => (
  <motion.div 
    className={cn("space-y-2", className)}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    {Array.from({ length: lines }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.1, duration: 0.4 }}
      >
        <Skeleton 
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      </motion.div>
    ))}
  </motion.div>
)

export const SkeletonAvatar = ({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Skeleton className={cn("rounded-full", sizeClasses[size], className)} />
    </motion.div>
  )
}

export const SkeletonButton = ({ className }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    <Skeleton className={cn("h-10 w-24", className)} />
  </motion.div>
)

export const SkeletonCard = ({ className }: { className?: string }) => (
  <motion.div 
    className={cn("rounded-2xl border border-gray-200 bg-white p-4 space-y-4", className)}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <motion.div 
      className="flex items-center space-x-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <SkeletonAvatar size="sm" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </motion.div>
    <SkeletonText lines={3} />
    <motion.div 
      className="flex justify-between items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <Skeleton className="h-4 w-20" />
      <SkeletonButton />
    </motion.div>
  </motion.div>
)

export const SkeletonOrderCard = ({ className }: { className?: string }) => (
  <motion.div 
    className={cn("rounded-2xl border border-gray-200 bg-white p-4 space-y-4", className)}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <motion.div 
      className="flex justify-between items-start"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-16" />
    </motion.div>
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </motion.div>
    <motion.div 
      className="flex justify-between items-center pt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-24" />
    </motion.div>
  </motion.div>
)

export const SkeletonAddressCard = ({ className }: { className?: string }) => (
  <motion.div 
    className={cn("rounded-2xl border border-gray-200 bg-white p-4 space-y-4", className)}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    <motion.div 
      className="flex justify-between items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-6 w-12" />
    </motion.div>
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </motion.div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
    >
      <Skeleton className="h-10 w-full" />
    </motion.div>
  </motion.div>
)

export const SkeletonCheckoutSheet = ({ className }: { className?: string }) => (
  <motion.div 
    className={cn("space-y-4", className)}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      <SkeletonCard />
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <SkeletonAddressCard />
    </motion.div>
    <motion.div 
      className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
    >
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
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
    >
      <Skeleton className="h-12 w-full rounded-xl" />
    </motion.div>
  </motion.div>
)

export default Skeleton