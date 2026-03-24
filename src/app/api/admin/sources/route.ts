import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { fetchRssFeed } from '@/lib/rss'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sources = await prisma.dataSource.findMany({
    orderBy: [{ slot: 'asc' }, { priority: 'asc' }],
  })

  return NextResponse.json(sources)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  // Test connection
  if (body.action === 'test') {
    try {
      const items = await fetchRssFeed(body.url, 1)
      await prisma.dataSource.update({
        where: { id: body.id },
        data: { lastChecked: new Date(), lastStatus: 'ok', errorMsg: null },
      })
      return NextResponse.json({ ok: true, items })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection failed'
      await prisma.dataSource.update({
        where: { id: body.id },
        data: { lastChecked: new Date(), lastStatus: 'error', errorMsg },
      })
      return NextResponse.json({ ok: false, error: errorMsg })
    }
  }

  const source = await prisma.dataSource.create({
    data: {
      name: body.name,
      type: body.type,
      url: body.url,
      slot: body.slot,
      priority: body.priority || 5,
    },
  })

  return NextResponse.json(source)
}
