'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'orderDraft:v1'
const DEBOUNCE_MS = 300
const VALIDATION_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes

interface OrderDraft {
  name?: string
  phone?: string
  address?: string
  submitRejectedNotServiceable?: boolean
  validationTimestamp?: number
  lastAddress?: string
}

// Simple validation for draft shape
function isValidDraft(obj: any): obj is OrderDraft {
  if (!obj || typeof obj !== 'object') return false
  
  const { name, phone, address, submitRejectedNotServiceable, validationTimestamp, lastAddress, ...rest } = obj
  
  // Only allow expected keys
  if (Object.keys(rest).length > 0) return false
  
  // Validate string fields and length limits
  if (name !== undefined && (typeof name !== 'string' || name.length > 200)) return false
  if (phone !== undefined && (typeof phone !== 'string' || phone.length > 200)) return false
  if (address !== undefined && (typeof address !== 'string' || address.length > 200)) return false
  if (lastAddress !== undefined && (typeof lastAddress !== 'string' || lastAddress.length > 200)) return false
  
  // Validate boolean flag
  if (submitRejectedNotServiceable !== undefined && typeof submitRejectedNotServiceable !== 'boolean') return false
  
  // Validate timestamp
  if (validationTimestamp !== undefined && (typeof validationTimestamp !== 'number' || validationTimestamp < 0)) return false
  
  return true
}

function readFromStorage(): OrderDraft | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const parsed = JSON.parse(stored)
    if (!isValidDraft(parsed)) return null
    
    // Check if validation state is expired or address has changed
    const now = Date.now()
    if (parsed.submitRejectedNotServiceable && parsed.validationTimestamp) {
      const isExpired = (now - parsed.validationTimestamp) > VALIDATION_EXPIRY_MS
      if (isExpired) {
        // Clear expired validation state
        const { submitRejectedNotServiceable, validationTimestamp, lastAddress, ...cleanDraft } = parsed
        writeToStorage(cleanDraft)
        return cleanDraft
      }
    }
    
    return parsed
  } catch {
    return null
  }
}

function writeToStorage(draft: OrderDraft): void {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    
    if (process.env.NODE_ENV === 'development') {
      console.info('Draft saved to sessionStorage')
    }
  } catch {
    // Ignore storage errors
  }
}

function clearStorage(): void {
  if (typeof window === 'undefined') return
  
  try {
    sessionStorage.removeItem(STORAGE_KEY)
    
    if (process.env.NODE_ENV === 'development') {
      console.info('Draft cleared from sessionStorage')
    }
  } catch {
    // Ignore storage errors
  }
}

export function useOrderDraft(initial?: Partial<OrderDraft>) {
  const [draft, setDraft] = useState<OrderDraft>(initial || {})
  const [hasHydrated, setHasHydrated] = useState(false)
  const writeTimer = useRef<number | null>(null)
  const hasHydratedRef = useRef(false)

  // Stable debounced write using ref (no deps to avoid recreation)
  const debouncedWrite = useCallback((d: OrderDraft) => {
    if (writeTimer.current) {
      window.clearTimeout(writeTimer.current)
    }
    writeTimer.current = window.setTimeout(() => {
      writeToStorage(d)
    }, DEBOUNCE_MS)
  }, [])

  // Functional state update with early return and hydration guard
  const setField = useCallback((key: keyof OrderDraft, value: string) => {
    setDraft(prev => {
      // Early return if value hasn't changed (prevents unnecessary updates)
      if (prev[key] === value) return prev
      
      const next = { ...prev, [key]: value }
      
      // Clear validation state when address changes
      if (key === 'address' && prev.submitRejectedNotServiceable) {
        const { submitRejectedNotServiceable, validationTimestamp, lastAddress, ...cleanNext } = next
        const finalNext = { ...cleanNext, lastAddress: value }
        
        // Only write to storage after initial hydration to prevent echo loops
        if (hasHydratedRef.current) {
          if (writeTimer.current) {
            window.clearTimeout(writeTimer.current)
          }
          writeTimer.current = window.setTimeout(() => {
            writeToStorage(finalNext)
          }, DEBOUNCE_MS)
        }
        
        return finalNext
      }
      
      // Only write to storage after initial hydration to prevent echo loops
      if (hasHydratedRef.current) {
        // Use the stable writeTimer ref directly to avoid dependency issues
        if (writeTimer.current) {
          window.clearTimeout(writeTimer.current)
        }
        writeTimer.current = window.setTimeout(() => {
          writeToStorage(next)
        }, DEBOUNCE_MS)
      }
      
      return next
    })
  }, [])

  // Set all values at once (for hydration)
  const setAll = useCallback((nextDraft: OrderDraft) => {
    setDraft(nextDraft)
  }, [])

  // Clear draft and storage
  const clearDraft = useCallback(() => {
    setDraft({})
    clearStorage()
    if (writeTimer.current) {
      window.clearTimeout(writeTimer.current)
    }
  }, [])

  // Set validation rejection flag
  const setSubmitRejected = useCallback((rejected: boolean) => {
    setDraft(prev => {
      const next = { 
        ...prev, 
        submitRejectedNotServiceable: rejected,
        validationTimestamp: rejected ? Date.now() : undefined,
        lastAddress: rejected ? prev.address : undefined
      }
      
      // Write immediately for validation state changes
      if (hasHydratedRef.current) {
        if (writeTimer.current) {
          window.clearTimeout(writeTimer.current)
        }
        writeTimer.current = window.setTimeout(() => {
          writeToStorage(next)
        }, DEBOUNCE_MS)
      }
      
      return next
    })
  }, [])

  // Clear validation rejection flag when address becomes serviceable
  const clearSubmitRejected = useCallback(() => {
    setDraft(prev => {
      if (!prev.submitRejectedNotServiceable) return prev
      
      const next = { 
        ...prev, 
        submitRejectedNotServiceable: false,
        validationTimestamp: undefined,
        lastAddress: undefined
      }
      
      // Write immediately for validation state changes
      if (hasHydratedRef.current) {
        if (writeTimer.current) {
          window.clearTimeout(writeTimer.current)
        }
        writeTimer.current = window.setTimeout(() => {
          writeToStorage(next)
        }, DEBOUNCE_MS)
      }
      
      return next
    })
  }, [])

  // One-time hydration from storage on mount
  useEffect(() => {
    const stored = readFromStorage()
    if (stored) {
      setDraft(stored)
      if (process.env.NODE_ENV === 'development') {
        console.info('Draft hydrated from sessionStorage')
      }
    }
    setHasHydrated(true)
    hasHydratedRef.current = true
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (writeTimer.current) {
        window.clearTimeout(writeTimer.current)
      }
    }
  }, [])

  return {
    draft,
    setField,
    setAll,
    clearDraft,
    setSubmitRejected,
    clearSubmitRejected,
    hasHydrated
  }
}

export function preserveDraftAndSignIn(
  currentDraft: OrderDraft,
  next: string = 'order'
) {
  // Write immediately (no debounce for navigation)
  writeToStorage(currentDraft)
  
  // Use router in a React context
  const router = useRouter()
  if (next === 'order') {
    router.push('/auth/guest-gate?from=order')
  } else {
    router.push(`/signin?from=${next}`)
  }
}

// Hook wrapper for preserveDraftAndSignIn to be used in components
export function usePreserveDraftAndSignIn() {
  const router = useRouter()
  
  return useCallback((currentDraft: OrderDraft, next: string = 'order') => {
    writeToStorage(currentDraft)
    if (next === 'order') {
      router.push('/auth/guest-gate?from=order')
    } else {
      router.push(`/signin?from=${next}`)
    }
  }, [router])
}
