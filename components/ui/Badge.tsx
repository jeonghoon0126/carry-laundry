import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info'
  children: React.ReactNode
  className?: string
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', children, className }, ref) => {
    const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    
    const variantClasses = {
      default: "bg-gray-100 text-gray-800",
      success: "bg-green-100 text-green-800",
      danger: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
      info: "bg-blue-100 text-blue-800"
    }
    
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      className
    )
    
    return (
      <span ref={ref} className={classes}>
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export default Badge
