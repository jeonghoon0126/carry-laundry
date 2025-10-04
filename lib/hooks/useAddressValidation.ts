import { useState, useEffect, useRef, useCallback } from 'react'

interface UseAddressValidationReturn {
  isValidating: boolean
  isServiceable: boolean
  message: string
  validateNow: () => Promise<{ isServiceable: boolean; message: string }>
}

export function useAddressValidation(address: string): UseAddressValidationReturn {
  const [isValidating, setIsValidating] = useState(false)
  const [isServiceable, setIsServiceable] = useState(false)
  const [message, setMessage] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  // Immediate validation function (no debounce)
  const validateNow = useCallback(async (): Promise<{ isServiceable: boolean; message: string }> => {
    const currentAddress = address.trim()
    
    // Reset state immediately when address is empty
    if (!currentAddress || currentAddress.length === 0) {
      setIsValidating(false)
      setIsServiceable(false)
      setMessage('')
      return { isServiceable: false, message: '' }
    }

    // Don't validate very short addresses
    if (currentAddress.length < 5) {
      setIsValidating(false)
      setIsServiceable(false)
      setMessage('')
      return { isServiceable: false, message: '' }
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    
    setIsValidating(true)
    setMessage('최종 주소 확인 중...')

    try {
      const response = await fetch(`/api/geo/preview?address=${encodeURIComponent(currentAddress)}`, {
        signal: abortControllerRef.current.signal
      })
      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || '주소를 찾을 수 없습니다.'
        setIsServiceable(false)
        setMessage(errorMessage)
        return { isServiceable: false, message: errorMessage }
      }

      if (data.isServiceable) {
        const successMessage = `서비스 가능 지역입니다 (${data.si} ${data.gu})`
        setIsServiceable(true)
        setMessage(successMessage)
        return { isServiceable: true, message: successMessage }
      } else {
        const errorMessage = '관악구 외 지역은 아직 서비스하지 않습니다.'
        setIsServiceable(false)
        setMessage(errorMessage)
        return { isServiceable: false, message: errorMessage }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't update state
        return { isServiceable: false, message: '' }
      }
      
      const errorMessage = '주소 확인 중 오류가 발생했습니다.'
      setIsServiceable(false)
      setMessage(errorMessage)
      return { isServiceable: false, message: errorMessage }
    } finally {
      setIsValidating(false)
      abortControllerRef.current = null
    }
  }, [address])

  useEffect(() => {
    // Reset state immediately when address changes (before debounced validation)
    if (!address || address.trim().length === 0) {
      setIsValidating(false)
      setIsServiceable(false)
      setMessage('')
      return
    }

    // Don't validate very short addresses
    if (address.trim().length < 5) {
      setIsValidating(false)
      setIsServiceable(false)
      setMessage('')
      return
    }

    // Cancel any in-flight request when address changes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Debounced validation for live feedback
    const timer = setTimeout(async () => {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()
      
      setIsValidating(true)
      setMessage('주소 확인 중...')

      try {
        const response = await fetch(`/api/geo/preview?address=${encodeURIComponent(address.trim())}`, {
          signal: abortControllerRef.current.signal
        })
        const data = await response.json()

        if (!response.ok) {
          setIsServiceable(false)
          setMessage(data.error || '주소를 찾을 수 없습니다.')
          return
        }

        if (data.isServiceable) {
          setIsServiceable(true)
          setMessage(`서비스 가능 지역입니다 (${data.si} ${data.gu})`)
        } else {
          setIsServiceable(false)
          setMessage('관악구 외 지역은 아직 서비스하지 않습니다.')
        }

      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Request was cancelled, don't update state
          return
        }
        
        setIsServiceable(false)
        setMessage('주소 확인 중 오류가 발생했습니다.')
      } finally {
        setIsValidating(false)
        abortControllerRef.current = null
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [address])

  return {
    isValidating,
    isServiceable,
    message,
    validateNow
  }
}
