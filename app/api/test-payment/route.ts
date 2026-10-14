import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Retired: a GET request must never mark an order as paid.
export async function GET() {
  return NextResponse.json(
    { error: 'Test payment endpoint is disabled' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } }
  )
}
