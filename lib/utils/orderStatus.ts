import { OrderStatus, OrderProgress } from '@/lib/types/order'

// 주문 상태별 정보 매핑
export const ORDER_STATUS_INFO: Record<OrderStatus, OrderProgress> = {
  pending: {
    status: 'pending',
    statusText: '주문 접수',
    description: '주문이 접수되었습니다. 곧 처리 예정입니다.',
    icon: '📝',
    completed: true
  },
  processing: {
    status: 'processing',
    statusText: '처리 중',
    description: '세탁소에서 세탁을 진행하고 있습니다.',
    icon: '🧺',
    completed: false
  },
  completed: {
    status: 'completed',
    statusText: '세탁 완료',
    description: '세탁이 완료되었습니다. 배송 준비 중입니다.',
    icon: '✅',
    completed: false
  },
  delivered: {
    status: 'delivered',
    statusText: '배송 완료',
    description: '배송이 완료되었습니다. 이용해주셔서 감사합니다!',
    icon: '🎉',
    completed: false
  },
  cancelled: {
    status: 'cancelled',
    statusText: '주문 취소',
    description: '주문이 취소되었습니다.',
    icon: '❌',
    completed: true
  }
}

// 주문 상태별 진행률 계산
export function getOrderProgress(orderStatus: OrderStatus): number {
  const progressMap: Record<OrderStatus, number> = {
    pending: 25,
    processing: 50,
    completed: 75,
    delivered: 100,
    cancelled: 0
  }
  return progressMap[orderStatus] || 0
}

// 주문 상태 변경 가능 여부 확인
export function canChangeOrderStatus(
  currentStatus: OrderStatus, 
  targetStatus: OrderStatus
): boolean {
  // 취소된 주문은 상태 변경 불가
  if (currentStatus === 'cancelled') {
    return false
  }
  
  // 상태 변경 규칙 정의
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['processing', 'cancelled'],
    processing: ['completed', 'cancelled'],
    completed: ['delivered'],
    delivered: [], // 배송 완료 후에는 상태 변경 불가
    cancelled: []
  }
  
  return allowedTransitions[currentStatus]?.includes(targetStatus) || false
}

// 주문 상태에 따른 예상 완료 시간 계산
export function getEstimatedCompletionTime(orderStatus: OrderStatus): string {
  const now = new Date()
  const estimates: Record<OrderStatus, number> = {
    pending: 2, // 2시간 후
    processing: 24, // 24시간 후
    completed: 2, // 2시간 후
    delivered: 0,
    cancelled: 0
  }
  
  const hours = estimates[orderStatus] || 0
  if (hours === 0) return ''
  
  const estimatedTime = new Date(now.getTime() + hours * 60 * 60 * 1000)
  return estimatedTime.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 주문 상태별 다음 단계 정보
export function getNextStepInfo(currentStatus: OrderStatus): {
  nextStatus?: OrderStatus
  nextStatusText?: string
  estimatedTime?: string
} | null {
  const nextStepMap: Record<OrderStatus, {
    nextStatus: OrderStatus
    nextStatusText: string
    estimatedTime: string
  } | null> = {
    pending: {
      nextStatus: 'processing',
      nextStatusText: '처리 시작',
      estimatedTime: '약 30분 내'
    },
    processing: {
      nextStatus: 'completed',
      nextStatusText: '세탁 완료',
      estimatedTime: '약 24시간 내'
    },
    completed: {
      nextStatus: 'delivered',
      nextStatusText: '배송 완료',
      estimatedTime: '약 2시간 내'
    },
    delivered: null,
    cancelled: null
  }
  
  return nextStepMap[currentStatus] || null
}

// 주문 상태별 액션 가능 여부
export function getOrderActions(orderStatus: OrderStatus): {
  canCancel: boolean
  canViewPhotos: boolean
  canTrackProgress: boolean
} {
  return {
    canCancel: ['pending', 'processing'].includes(orderStatus),
    canViewPhotos: ['completed', 'delivered'].includes(orderStatus),
    canTrackProgress: !['cancelled'].includes(orderStatus)
  }
}
