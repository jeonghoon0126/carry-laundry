/**
 * 피개행개 웹 결제 상품 카탈로그 (서버 신뢰 기준)
 *
 * 브라우저가 보낸 금액을 신뢰하지 않기 위해, 서버에서 상품 ID로 금액을 다시 찾아
 * 포트원 결제 조회 결과의 금액과 대조한다. 가격을 바꿀 때는 이 파일과
 * app/pigaehaenggae/page.tsx 의 표시 가격을 함께 수정한다.
 */

export interface PigaehaenggaePlan {
  /** 결제 요청 시 브라우저가 함께 보내는 상품 식별자 */
  id: string
  /** 포트원 결제창에 표시되는 주문명 */
  orderName: string
  /** 실제 결제 금액(원). 서버 대조 기준값 */
  amount: number
  /** 결제 통화 (포트원 V2 표기) */
  currency: 'KRW'
}

/** 피개행개 포트원 V2 상점 ID — 이 상점으로 생성된 결제만 유효하게 본다. */
export const PIGAEHAENGGAE_STORE_ID = 'store-b5db7fb0-7efb-488a-9436-96e195c272e1'

export const PIGAEHAENGGAE_PLANS: readonly PigaehaenggaePlan[] = [
  {
    id: 'basic-monthly',
    orderName: '피개행개 베이직 1개월 이용권',
    amount: 14900,
    currency: 'KRW',
  },
  {
    id: 'premium-yearly',
    orderName: '피개행개 프리미엄 1년 이용권',
    amount: 49000,
    currency: 'KRW',
  },
] as const

export function findPlan(planId: unknown): PigaehaenggaePlan | undefined {
  if (typeof planId !== 'string') return undefined
  return PIGAEHAENGGAE_PLANS.find((plan) => plan.id === planId)
}
