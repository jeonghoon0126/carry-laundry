import React from 'react'
import { cn } from '@/lib/utils'

interface RadioCardProps {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}

const RadioCard = React.forwardRef<HTMLDivElement, RadioCardProps>(
  ({ selected, onClick, children, className }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "relative p-4 rounded-lg border cursor-pointer transition-all duration-200",
          "hover:ring-2 hover:ring-[#13C2C2]/20 hover:border-[#13C2C2]/30",
          selected
            ? "border-[#13C2C2] bg-[#13C2C2]/5 ring-2 ring-[#13C2C2]/20"
            : "border-gray-200 bg-white",
          className
        )}
      >
        {children}
        
        {/* Radio indicator */}
        <div className="absolute top-4 right-4">
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 transition-colors",
              selected
                ? "border-[#13C2C2] bg-[#13C2C2]"
                : "border-gray-300"
            )}
          >
            {selected && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)

RadioCard.displayName = "RadioCard"

export default RadioCard
