import React from 'react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ 
    icon, 
    title = "아직 주문이 없습니다", 
    description,
    actionLabel = "주문하러 가기",
    onAction,
    className 
  }, ref) => {
    const defaultIcon = (
      <svg className="w-12 h-12 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )

    return (
      <div
        ref={ref}
        className={cn(
          "text-center py-12",
          className
        )}
      >
        <div className="mx-auto w-24 h-24 bg-[#1a2141] rounded-full flex items-center justify-center mb-6">
          {icon || defaultIcon}
        </div>
        
        <h3 className="text-lg font-medium text-[var(--text)] mb-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-[var(--muted)] mb-6">
            {description}
          </p>
        )}
        
        {onAction && (
          <Button
            variant="primary"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    )
  }
)

EmptyState.displayName = "EmptyState"

export default EmptyState
