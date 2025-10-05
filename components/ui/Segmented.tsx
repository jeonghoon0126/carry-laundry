import React from 'react'
import { cn } from '@/lib/utils'

interface SegmentedOption {
  value: string
  label: string
}

interface SegmentedProps {
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

const Segmented = React.forwardRef<HTMLDivElement, SegmentedProps>(
  ({ options, value, onChange, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex rounded-full bg-gray-100 p-1",
          className
        )}
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
              value === option.value
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    )
  }
)

Segmented.displayName = "Segmented"

export default Segmented
