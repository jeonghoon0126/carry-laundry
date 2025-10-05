import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'sm'
  as?: 'button' | 'a'
  href?: string
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    as = 'button', 
    className, 
    children, 
    disabled,
    href,
    ...props 
  }, ref) => {
    const baseClasses = "rounded-lg font-medium shadow-sm focus:ring-2 focus:ring-[#13C2C2]/20 focus:outline-none transition duration-150"
    
    const variantClasses = {
      primary: "bg-[#13C2C2] text-white hover:bg-[#0FA8A8]",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100"
    }
    
    const sizeClasses = {
      md: "px-4 py-2",
      sm: "px-3 py-1.5 text-sm"
    }
    
    const disabledClasses = disabled ? "opacity-50 pointer-events-none" : ""
    
    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      disabledClasses,
      className
    )
    
    if (as === 'a' && href) {
      return (
        <a
          href={href}
          className={classes}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      )
    }
    
    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export default Button
