"use client"

import { SessionProvider } from "next-auth/react"
import { OrderProgressProvider } from "@/lib/contexts/OrderProgressContext"

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <OrderProgressProvider>
        {children}
      </OrderProgressProvider>
    </SessionProvider>
  )
}



