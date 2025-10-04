'use client'

import { ReactNode } from 'react'
import { usePreserveDraftAndSignIn } from '@/lib/hooks/useOrderDraft'

interface PreserveDraftLoginProps {
  children: ReactNode
  getCurrentDraft?: () => {
    name?: string
    phone?: string
    address?: string
  }
  from?: 'order' | 'mypage' | 'home'
}

export default function PreserveDraftLogin({
  children,
  getCurrentDraft,
  from = 'home'
}: PreserveDraftLoginProps) {
  const preserveDraftAndSignIn = usePreserveDraftAndSignIn()

  const handleClick = () => {
    const currentDraft = getCurrentDraft?.() || {}
    preserveDraftAndSignIn(currentDraft, from)
  }

  return (
    <div onClick={handleClick} role="button" style={{ cursor: 'pointer' }}>
      {children}
    </div>
  )
}
