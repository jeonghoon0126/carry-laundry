import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * 헬스 체크 API
 * 시스템 상태를 모니터링합니다.
 */

export async function GET() {
  const startTime = Date.now()
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      payments: 'unknown',
    },
    responseTime: 0,
    environment: process.env.NODE_ENV,
  }

  try {
    // 1. Supabase 데이터베이스 연결 테스트
    try {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        healthCheck.services.database = 'missing_env_vars'
      } else {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { error } = await supabase.from('orders').select('id').limit(1)
        healthCheck.services.database = error ? 'error' : 'healthy'
      }
    } catch (error) {
      healthCheck.services.database = 'error'
    }

    // 2. 결제 시스템 환경 변수 체크
    const hasTossClientKey = !!process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
    const hasTossSecretKey = !!process.env.TOSS_SECRET_KEY
    
    if (hasTossClientKey && hasTossSecretKey) {
      healthCheck.services.payments = 'healthy'
    } else {
      healthCheck.services.payments = 'missing_keys'
    }

    // 3. 전체 상태 결정
    const allHealthy = Object.values(healthCheck.services).every(status => status === 'healthy')
    healthCheck.status = allHealthy ? 'healthy' : 'degraded'

  } catch (error) {
    healthCheck.status = 'unhealthy'
  } finally {
    healthCheck.responseTime = Date.now() - startTime
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 200 : 503

  return NextResponse.json(healthCheck, { status: statusCode })
}
