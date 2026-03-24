import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { runMorningSchedule, runAfternoonSchedule, runEveningSchedule } from '@/lib/scheduler'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
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
