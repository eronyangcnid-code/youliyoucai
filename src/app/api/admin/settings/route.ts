import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await prisma.systemSetting.findMany()
  const result: Record<string, string> = {}
  for (const s of settings) {
    result[s.key] = s.value
  }

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const updates = await Promise.all(
    Object.entries(body as Record<string, string>).map(([key, value]) =>
      prisma.systemSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  )

  return NextResponse.json({ updated: updates.length })
}
