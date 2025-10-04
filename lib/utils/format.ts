/**
 * Utility functions for formatting user data
 */

/**
 * Masks phone number for privacy
 * @param phone - Phone number string
 * @returns Masked phone number (e.g., "010-****-0293")
 */
export function maskPhone(phone: string): string {
  if (!phone) return ''
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '')
  
  // Handle different phone number formats
  if (digits.length === 11 && digits.startsWith('010')) {
    // 010-1234-5678 format
    return `${digits.slice(0, 3)}-****-${digits.slice(7)}`
  } else if (digits.length === 10 && digits.startsWith('010')) {
    // 010-123-4567 format
    return `${digits.slice(0, 3)}-****-${digits.slice(6)}`
  } else if (digits.length >= 8) {
    // Generic masking for other formats
    const start = digits.slice(0, 3)
    const end = digits.slice(-4)
    return `${start}-****-${end}`
  }
  
  return phone // Return original if can't mask
}

/**
 * Truncates address for display
 * @param address - Full address string
 * @param maxLength - Maximum length (default: 24)
 * @returns Truncated address with ellipsis
 */
export function shortAddress(address: string, maxLength: number = 24): string {
  if (!address) return ''
  
  if (address.length <= maxLength) {
    return address
  }
  
  return address.slice(0, maxLength) + '...'
}

/**
 * Formats date to Korean locale
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatOrderDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch {
    return dateString
  }
}

/**
 * Gets user initials from name
 * @param name - User name
 * @returns Initials (e.g., "정훈" -> "정훈")
 */
export function getUserInitials(name: string | null | undefined): string {
  if (!name) return '고'
  
  // For Korean names, take first 2 characters
  if (name.length >= 2) {
    return name.slice(0, 2)
  }
  
  return name.slice(0, 1)
}

/**
 * Gets display name for user
 * @param name - User name
 * @returns Display name with fallback
 */
export function getDisplayName(name: string | null | undefined): string {
  return name || '고객님'
}