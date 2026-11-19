/**
 * 피개행개 이용권(유료 상품)의 "혜택" 문구 — 서버·클라이언트 공용 표시 기준
 *
 * 왜 따로 두나:
 *  - 무료 앱 기능(몸무게·견종 필터, 전국 장소 탐색, 오늘의 산책 링, 동네 산책 친구)과
 *    겹치지 않는 실제 유료 혜택만 적어야 한다.
 *  - 혜택 내용은 정훈님 확정 사항이라, 문구를 바꿀 때 이 파일 하나만 고치면
 *    /pigaehaenggae 와 /terms 가 함께 바뀐다. (가격은 lib/pigaehaenggae/plans.ts)
 *
 * 현재 들어 있는 값은 확정 전 **임시안 A: 캐리(Carry) 침구 세탁 할인권** 이다.
 * 후보 비교와 대안 문구는 docs/pigaehaenggae-plan-benefits.md 참고.
 */

export type PlanId = 'basic-monthly' | 'premium-yearly'

export interface PlanBenefitCopy {
  /** 카드 하단 요약 문장 */
  summary: string
  /** 체크 목록으로 노출되는 혜택 항목 */
  items: readonly string[]
}

export const PLAN_BENEFITS: Record<PlanId, PlanBenefitCopy> = {
  'basic-monthly': {
    summary:
      '피개행개 앱을 그대로 쓰면서, 운영사 캐리가 직접 운영하는 침구 세탁 서비스 할인 혜택을 함께 받는 1개월 이용권입니다.',
    items: [
      '캐리(Carry) 침구 세탁 20% 할인권 3매 (1회 주문당 1매 사용)',
      '반려견 이불·방석 등 침구류 세탁에 사용 가능',
      '할인권은 이용권 기간(1개월) 동안 사용',
      '전국 4,600여 곳 애견동반 플레이스 탐색과 산책 기록 기능은 무료로 계속 이용',
    ],
  },
  'premium-yearly': {
    summary:
      '피개행개 앱을 1년 내내 쓰면서, 캐리 침구 세탁 할인 혜택을 한 해 동안 챙기는 1년 이용권입니다.',
    items: [
      '캐리(Carry) 침구 세탁 20% 할인권 12매 (매월 1매)',
      '반려견 이불·방석 침구 세탁 1회 무료 쿠폰',
      '할인권은 이용권 기간(1년) 동안 사용',
      '전국 4,600여 곳 애견동반 플레이스 탐색과 산책 기록 기능은 무료로 계속 이용',
    ],
  },
}

/** 이용권 공통 안내 (가격 카드 하단) */
export const PLAN_BENEFIT_NOTICE =
  '세탁 할인권은 캐리가 운영하는 침구 세탁 서비스 주문 시 사용할 수 있으며, 세탁 불가 품목(가죽·모피·실크 등)에는 사용할 수 없습니다.'

/** 환불 규정에서 쓰는 "미사용" 판단 기준 — 실제 유료 혜택 기준 */
export const REFUND_UNUSED_CONDITION = '이용권에 포함된 유료 혜택(세탁 할인권·무료 쿠폰)을 한 번도 사용하지 않은 경우'

/** 환불 규정에서 쓰는 "사용" 판단 기준 */
export const REFUND_USED_CONDITION = '유료 혜택을 이미 사용한 경우'
