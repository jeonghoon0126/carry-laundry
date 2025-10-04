'use client'
import { useEffect } from 'react'

export default function PaymentErrorAlert() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const search = new URLSearchParams(window.location.search)
    const error = search.get('error')
    const reason = search.get('reason')
    if (error === 'payment_failed') {
      const decodedReason = decodeURIComponent(reason || '')
      alert(`결제 실패: ${decodedReason}`)
    }
  }, [])
  
  return null
}
