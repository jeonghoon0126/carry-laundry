export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

import 'server-only'
import { NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/kakao'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  // Validate input
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return NextResponse.json({
      error: "주소를 입력해주세요."
    }, { status: 400 })
  }

  try {
    // Use the hardened geocoding function
    const geocodeResult = await geocodeAddress(address)
    const { si, gu, dong, isServiceable } = geocodeResult

    // Log minimal info (no PII)
    console.log(`Geocoding preview: si=${si}, gu=${gu}, dong=${dong}, serviceable=${isServiceable}`)

    return NextResponse.json({
      isServiceable,
      si,
      gu,
      dong
    })

  } catch (error) {
    // Handle geocoding errors gracefully - log minimal info
    console.log(`Geocoding preview failed`)
    
    return NextResponse.json({
      error: "주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요."
    }, { status: 400 })
  }
}
