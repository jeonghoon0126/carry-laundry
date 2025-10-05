'use server'

import { getSupabaseServer } from '@/lib/supabase-server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export interface OrderHistoryItem {
  id: number
  created_at: string
  name: string
  phone: string
  address: string
  paid: boolean
  payment_amount: number | null
  payment_method: string | null
  payment_receipt_url: string | null
}

export interface OrderHistoryResponse {
  orders: OrderHistoryItem[]
  hasMore: boolean
  nextCursor?: string
  prevCursor?: string
}

/**
 * Fetches user's order history with cursor-based pagination
 */
export async function getUserOrderHistory(
  cursor?: string,
  limit: number = 10
): Promise<OrderHistoryResponse> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    throw new Error('User not authenticated')
  }

  const supabase = getSupabaseServer()
  
  try {
    // Build query with cursor-based pagination
    let query = supabase
      .from('orders')
      .select('id, created_at, name, phone, address, paid, payment_amount, payment_method, payment_receipt_url')
      .eq('user_id', session.user.id)
      .order('id', { ascending: false })
      .limit(limit + 1) // Fetch one extra to check if there are more

    // Apply cursor if provided
    if (cursor) {
      const cursorId = parseInt(cursor, 10)
      query = query.lt('id', cursorId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching user orders:', error)
      throw new Error('Failed to fetch order history')
    }

    const orders = data || []
    const hasMore = orders.length > limit
    
    // Remove the extra item if we fetched one too many
    const actualOrders = hasMore ? orders.slice(0, limit) : orders
    
    // Generate cursors for pagination
    const nextCursor = hasMore && actualOrders.length > 0 
      ? actualOrders[actualOrders.length - 1].id.toString() 
      : undefined
      
    const prevCursor = cursor || undefined

    return {
      orders: actualOrders,
      hasMore,
      nextCursor,
      prevCursor
    }
  } catch (error) {
    console.error('Error in getUserOrderHistory:', error)
    throw new Error('Failed to fetch order history')
  }
}