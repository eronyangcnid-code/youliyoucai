import { NextResponse } from 'next/server'
import { fetchTWSEData } from '@/lib/financial'

export const revalidate = 300 // 5 minutes

export async function GET() {
  try {
    const twse = await fetchTWSEData()
    return NextResponse.json({ twse, timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
