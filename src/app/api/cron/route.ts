import { NextRequest, NextResponse } from 'next/server'
import { runMorningSchedule, runAfternoonSchedule, runEveningSchedule } from '@/lib/scheduler'

/**
 * Cron endpoint for GitHub Actions to trigger article generation.
 * Uses a secret bearer token for authentication.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const scheduleSecret = process.env.SCHEDULE_SECRET

  if (!scheduleSecret || authHeader !== `Bearer ${scheduleSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slot } = await req.json()

  try {
    let result
    if (slot === 'morning') {
      result = await runMorningSchedule()
    } else if (slot === 'afternoon') {
      result = await runAfternoonSchedule()
    } else if (slot === 'evening') {
      result = await runEveningSchedule()
    } else {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
