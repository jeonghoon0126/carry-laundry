'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Database, CreditCard } from 'lucide-react'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: {
    database: string
    payments: string
  }
  responseTime: number
  environment: string
}

export default function MonitoringPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  const fetchHealthStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealthStatus(data)
      setLastChecked(new Date())
    } catch (error) {
      console.error('Failed to fetch health status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthStatus()
    // 30초마다 자동 새로고침
    const interval = setInterval(fetchHealthStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-red-50 border-red-200 text-red-800'
    }
  }

  if (!healthStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">상태를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">시스템 모니터링</h1>
          <p className="text-gray-600">
            마지막 확인: {lastChecked.toLocaleString('ko-KR')}
          </p>
        </div>

        {/* Overall Status */}
        <div className={`rounded-lg border p-6 mb-6 ${getStatusColor(healthStatus.status)}`}>
          <div className="flex items-center gap-3">
            {getStatusIcon(healthStatus.status)}
            <div>
              <h2 className="text-xl font-semibold">
                전체 시스템 상태: {healthStatus.status.toUpperCase()}
              </h2>
              <p className="text-sm opacity-75">
                응답 시간: {healthStatus.responseTime}ms | 환경: {healthStatus.environment}
              </p>
            </div>
            <button
              onClick={fetchHealthStatus}
              disabled={isLoading}
              className="ml-auto p-2 rounded-lg bg-white/50 hover:bg-white/70 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Services Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Database Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold">데이터베이스</h3>
              {getStatusIcon(healthStatus.services.database)}
            </div>
            <p className="text-sm text-gray-600">
              상태: {healthStatus.services.database}
            </p>
            <div className="mt-3 text-xs text-gray-500">
              Supabase 연결 상태를 확인합니다.
            </div>
          </div>

          {/* Payments Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-purple-500" />
              <h3 className="text-lg font-semibold">결제 시스템</h3>
              {getStatusIcon(healthStatus.services.payments)}
            </div>
            <p className="text-sm text-gray-600">
              상태: {healthStatus.services.payments}
            </p>
            <div className="mt-3 text-xs text-gray-500">
              Toss Payments 설정을 확인합니다.
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">환경 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">환경:</span>
              <span className="ml-2 text-gray-600">{healthStatus.environment}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">응답 시간:</span>
              <span className="ml-2 text-gray-600">{healthStatus.responseTime}ms</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">마지막 업데이트:</span>
              <span className="ml-2 text-gray-600">
                {new Date(healthStatus.timestamp).toLocaleString('ko-KR')}
              </span>
            </div>
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            자동 새로고침: 30초마다 업데이트
          </p>
        </div>
      </div>
    </div>
  )
}
