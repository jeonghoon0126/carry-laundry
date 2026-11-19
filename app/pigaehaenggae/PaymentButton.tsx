'use client'

import { useEffect, useRef, useState } from 'react'
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

const LINK_KEY = 'pghg_app_link'

/**
 * 피개행개 앱에서 넘어온 연결 표(#link=...)를 읽는다. 주소 # 뒤에 두어 서버 접속 기록과 공유 주소에 남지 않게 하고,
 * 읽자마자 주소에서 지운 뒤 이 탭(sessionStorage)에만 둔다. 휴대폰 결제창이 페이지를 이동했다 돌아와도 쓸 수 있다.
 * 서명 확인은 서버(verify-payment)가 한다. 여기서는 형식과 만료만 본다.
 */
function readAppLink(): { link: string; paymentId: string; exp: number } | null {
  try {
    const fromHash = new URLSearchParams(window.location.hash.slice(1)).get('link')
    if (fromHash) {
      sessionStorage.setItem(LINK_KEY, fromHash)
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    const link = fromHash || sessionStorage.getItem(LINK_KEY)
    if (!link || link.length > 1024) return null
    const body = link.split('.')[0]
    const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof payload?.pid !== 'string' || !/^pghg_[A-Za-z0-9_-]{4,80}$/.test(payload.pid)) return null
    if (typeof payload?.exp !== 'number') return null
    return { link, paymentId: payload.pid, exp: payload.exp }
  } catch {
    return null
  }
}

function forgetAppLink() {
  try { sessionStorage.removeItem(LINK_KEY) } catch { /* 저장소를 못 쓰는 브라우저 */ }
}

export default function PaymentButton({ planId, planName, amount, variant = 'primary' }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [verify, setVerify] = useState<VerifyState>({ kind: 'idle' })
  const returned = useRef(false)

  // 휴대폰 결제창은 페이지를 이동했다가 redirectUrl 로 돌아온다(?pghg_plan=..&paymentId=..&code=..).
  // 이 상품 버튼만 돌아온 결제를 서버에 확인하고, 주소의 결제 정보는 지운다.
  useEffect(() => {
    readAppLink() // 앱에서 연 주소의 #link 를 처음 열 때 바로 이 탭에 옮겨 둔다
    if (returned.current) return
    const q = new URLSearchParams(window.location.search)
    const paymentId = q.get('paymentId')
    if (q.get('pghg_plan') !== planId || !paymentId) return
    returned.current = true
    history.replaceState(null, '', window.location.pathname)
    const code = q.get('code')
    if (code) {
      const message = q.get('message') || '결제가 완료되지 않았습니다.'
      if (code !== 'FAILURE_TYPE_PG' || !message.includes('취소')) alert(`결제 안내: ${message}`)
      return
    }
    const appLink = readAppLink()
    void verifyPayment(paymentId, appLink?.paymentId === paymentId ? appLink.link : undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId])

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
        if (link) forgetAppLink()
        alert(
          '결제가 정상적으로 확인되었습니다. 피개행개 서비스를 이용해 주셔서 감사합니다!\n' +
            (data?.customerLinked ? '피개행개 앱의 내 강아지 화면에서 할인권을 확인할 수 있어요.\n' : '') +
            (data?.linkStatus === 'rejected' ? '앱 계정 연결은 확인하지 못했어요. 아래 결제번호를 고객센터(010-9432-0293)로 알려주시면 앱 계정에 연결해 드립니다.\n' : '') +
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
      const appLink = readAppLink()
      if (appLink && appLink.exp - Date.now() < 60_000) {
        // 만료 직전이거나 지난 표로 결제하면 앱 계정에 연결되지 않으므로, 결제 전에 막고 앱에서 다시 열게 한다.
        forgetAppLink()
        alert('앱에서 연 결제 화면의 시간이 지났어요. 피개행개 앱에서 이용권 버튼을 다시 눌러 주세요.')
        return
      }
      const paymentId = appLink?.paymentId ?? `pghg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const response = await window.PortOne.requestPayment({
        storeId: 'store-b5db7fb0-7efb-488a-9436-96e195c272e1',
        channelKey: 'channel-key-cfbbdc86-f786-4c1c-a0f7-42c5fd14ba67',
        paymentId,
        orderName: planName,
        totalAmount: amount,
        currency: 'CURRENCY_KRW',
        payMethod: 'CARD',
        redirectUrl: `${window.location.origin}${window.location.pathname}?pghg_plan=${encodeURIComponent(planId)}`,
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
