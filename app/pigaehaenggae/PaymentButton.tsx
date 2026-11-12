'use client'

import { useState } from 'react'
import Script from 'next/script'
import { CreditCard, Loader2 } from 'lucide-react'

interface PaymentButtonProps {
  planName: string
  amount: number
  variant?: 'primary' | 'secondary'
}

declare global {
  interface Window {
    PortOne?: {
      requestPayment: (options: any) => Promise<any>
    }
  }
}

export default function PaymentButton({ planName, amount, variant = 'primary' }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    if (typeof window === 'undefined') return
    if (!window.PortOne) {
      alert('결제 모듈을 로드하는 중입니다. 1~2초 후 다시 클릭해 주세요.')
      return
    }

    setLoading(true)
    try {
      const paymentId = `pghg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const response = await window.PortOne.requestPayment({
        storeId: 'store-b5db7fb0-7efb-488a-9436-96e195c272e1',
        channelKey: 'channel-key-dc5fa12d-c110-4615-b264-3d475cab21e9',
        paymentId,
        orderName: planName,
        totalAmount: amount,
        currency: 'CURRENCY_KRW',
        payMethod: 'CARD',
      })

      if (response?.code != null) {
        if (response.code !== 'FAILURE_TYPE_PG' || !response.message?.includes('취소')) {
          alert(`결제 안내: ${response.message || '결제가 완료되지 않았습니다.'}`)
        }
      } else {
        alert('테스트 결제가 성공적으로 완료되었습니다.')
      }
    } catch (err: any) {
      console.error('Payment request error:', err)
      alert(`결제 요청 중 오류가 발생했습니다: ${err?.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  const baseStyle = "w-full py-3 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
  const variantStyle = variant === 'primary'
    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
    : "bg-slate-900 text-white hover:bg-slate-800"

  return (
    <>
      <Script src="https://cdn.portone.io/v2/browser-sdk.js" strategy="lazyOnload" />
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className={`${baseStyle} ${variantStyle} disabled:opacity-50`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
        {planName} 결제하기 (신용카드)
      </button>
    </>
  )
}
