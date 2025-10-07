// 주문 관련 타입 정의

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'delivered' | 'cancelled'

export interface OrderProgress {
  status: OrderStatus
  statusText: string
  description: string
  icon: string
  completed: boolean
  estimatedTime?: string
}

export interface OrderWithProgress {
  id: number
  name: string
  phone: string
  address: string
  user_id: string
  si: string
  gu: string
  dong: string
  postal_code?: string
  lat: number
  lng: number
  is_serviceable: boolean
  paid: boolean
  paid_at?: string
  payment_key?: string
  payment_method?: string
  total_amount?: number
  payment_amount: number
  payment_total?: number
  receipt_url?: string
  approved_at?: string
  payment_id?: string
  payment_receipt_url?: string
  status: OrderStatus
  cancelled_at?: string
  cancel_reason?: string
  updated_at: string
  created_at: string
  
  // 새로운 상태 관리 필드들
  processing_started_at?: string
  completed_at?: string
  delivered_at?: string
  pickup_photo_url?: string
  delivery_photo_url?: string
  estimated_completion_time?: string
  
  // 계산된 필드들
  progress?: OrderProgress
  canCancel?: boolean
  estimatedDeliveryTime?: string
}

export interface OrderStatusUpdate {
  orderId: number
  status: OrderStatus
  notes?: string
  photos?: {
    pickup?: string
    delivery?: string
  }
}

export interface OrderStatusLog {
  id: number
  order_id: number
  from_status?: OrderStatus
  to_status: OrderStatus
  changed_by: string
  changed_at: string
  notes?: string
}
