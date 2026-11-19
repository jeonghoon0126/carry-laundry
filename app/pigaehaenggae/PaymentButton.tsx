'use client'

import { useState } from 'react'
import Script from 'next/script'
import { CreditCard, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react'

interface PaymentButtonProps {
  /** 서버 카탈로그(lib/pigaehaenggae/plans.ts)의 상품 ID */
  planId: string
  planName: string
  amount: number
  variant?: 'primary' | 'secondary'
}

type VerifyState =
  | { kind: 'idle' }
  | { kind: 'verifying' }
  | { kind: 'verified'; paymentId: string }
  | { kind: 'unverified'; paymentId: string; message: string }

declare global {
  interface Window {
    PortOne?: {
      requestPayment: (options: any) => Promise<any>
    }
  }
}

/**
 * 피개행개 앱에서 넘어온 연결 표(?link=...)에서 미리 만든 결제 ID를 읽는다.
 * 서명 확인은 서버(verify-payment)가 한다. 여기서는 형식만 보고, 이상하면 연결 없이 결제한다.
 */
function readAppLink(): { link: string; paymentId: string } | null {
  try {
    const link = new URLSearchParams(window.location.search).get('link')
    if (!link || link.length > 1024) return null
    const body = link.split('.')[0]
    const json = atob(body.replace(/-/g, '+').replace(/_/g, '/'))
    const pid = JSON.parse(json)?.pid
    if (typeof pid !== 'string' || !/^pghg_[A-Za-z0-9_-]{4,80}$/.test(pid)) return null
    return { link, paymentId: pid }
  } catch {
    return null
  }
}

/** 연결 표의 결제 ID로 결제가 확인되면 그 뒤 결제는 새 결제 ID로, 앱 연결 없이 한다. 결제창을 닫은 경우엔 같은 ID로 다시 시도한다. */
let appLinkUsed = false

export default function PaymentButton({ planId, planName, amount, variant = 'primary' }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [verify, setVerify] = useState<VerifyState>({ kind: 'idle' })

  /** 결제창 종료 후 서버에 결제 건을 검증 요청한다. 실패해도 결제 자체를 재시도시키지 않는다. */
  const verifyPayment = async (paymentId: string, link?: string) => {
    setVerify({ kind: 'verifying' })
    try {
      const res = await fetch('/api/pigaehaenggae/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link ? { paymentId, planId, link } : { paymentId, planId }),
      })
      const data = await res.json().catch(() => null)

      if (res.ok && data?.ok === true) {
        setVerify({ kind: 'verified', paymentId })
        if (link) appLinkUsed = true
        alert(
          '결제가 정상적으로 확인되었습니다. 피개행개 서비스를 이용해 주셔서 감사합니다!\n' +
            (data?.customerLinked ? '피개행개 앱의 내 강아지 화면에서 할인권을 확인할 수 있어요.\n' : '') +
            `결제번호: ${paymentId}`,
        )
        return
      }

      const message =
        typeof data?.message === 'string' && data.message
          ? data.message
          : '결제 확인이 아직 끝나지 않았습니다.'
      setVerify({ kind: 'unverified', paymentId, message })
      alert(
        `결제창은 완료되었지만 서버 확인이 끝나지 않았습니다.\n${message}\n` +
          `아래 결제번호를 고객센터(010-9432-0293)로 알려주시면 바로 확인해 드리겠습니다.\n결제번호: ${paymentId}`,
      )
    } catch {
      setVerify({
        kind: 'unverified',
        paymentId,
        message: '네트워크 문제로 결제 확인 요청을 보내지 못했습니다.',
      })
      alert(
        '결제창은 완료되었지만 서버 확인 요청이 전달되지 않았습니다.\n' +
          `아래 결제번호를 고객센터(010-9432-0293)로 알려주시면 바로 확인해 드리겠습니다.\n결제번호: ${paymentId}`,
      )
    }
  }

  const handlePayment = async () => {
    if (typeof window === 'undefined') return
    if (!window.PortOne) {
      alert('결제 모듈을 로드하는 중입니다. 1~2초 후 다시 클릭해 주세요.')
      return
    }

    setLoading(true)
    setVerify({ kind: 'idle' })
    try {
      const appLink = appLinkUsed ? null : readAppLink()
      const paymentId = appLink?.paymentId ?? `pghg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const response = await window.PortOne.requestPayment({
        storeId: 'store-b5db7fb0-7efb-488a-9436-96e195c272e1',
        channelKey: 'channel-key-cfbbdc86-f786-4c1c-a0f7-42c5fd14ba67',
        paymentId,
        orderName: planName,
        totalAmount: amount,
        currency: 'CURRENCY_KRW',
        payMethod: 'CARD',
      })

      if (response?.code != null) {
        // 사용자가 결제창을 닫은 경우(취소)에는 안내창을 띄우지 않는다.
        if (response.code !== 'FAILURE_TYPE_PG' || !response.message?.includes('취소')) {
          alert(`결제 안내: ${response.message || '결제가 완료되지 않았습니다.'}`)
        }
        return
      }

      // 결제창이 성공으로 끝났더라도 금액·상태는 서버에서 다시 확인한다.
      await verifyPayment(paymentId, appLink?.link)
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
    <div className="space-y-2">
      <Script src="https://cdn.portone.io/v2/browser-sdk.js" strategy="lazyOnload" />
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading || verify.kind === 'verifying'}
        className={`${baseStyle} ${variantStyle} disabled:opacity-50`}
      >
        {loading || verify.kind === 'verifying'
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <CreditCard className="w-4 h-4" />}
        {verify.kind === 'verifying' ? '결제 확인 중…' : `${planName} 결제하기 (신용카드)`}
      </button>

      {verify.kind === 'verified' && (
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>결제가 확인되었습니다. 결제번호 {verify.paymentId}</span>
        </p>
      )}

      {verify.kind === 'unverified' && (
        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            {verify.message} 결제번호 {verify.paymentId} 를 고객센터(010-9432-0293)로 알려주세요.
          </span>
        </p>
      )}
    </div>
  )
}
