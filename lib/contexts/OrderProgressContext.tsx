'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface OrderProgressContextType {
  isOrderProgressVisible: boolean
  setIsOrderProgressVisible: (visible: boolean) => void
}

const OrderProgressContext = createContext<OrderProgressContextType | undefined>(undefined)

export function OrderProgressProvider({ children }: { children: ReactNode }) {
  const [isOrderProgressVisible, setIsOrderProgressVisible] = useState(false)

  return (
    <OrderProgressContext.Provider value={{ isOrderProgressVisible, setIsOrderProgressVisible }}>
      {children}
    </OrderProgressContext.Provider>
  )
}

export function useOrderProgress() {
  const context = useContext(OrderProgressContext)
  if (context === undefined) {
    throw new Error('useOrderProgress must be used within an OrderProgressProvider')
  }
  return context
}
