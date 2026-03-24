import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { action, reviewNote, scheduledPublishAt } = await req.json()

  if (!['approve', 'reject', 'publish'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const userId = (session.user as { id?: string }).id

  let updateData: Record<string, unknown> = {
    reviewedById: userId,
    reviewNote: reviewNote || null,
  }

  if (action === 'approve') {
    updateData.status = scheduledPublishAt ? 'scheduled' : 'published'
    if (scheduledPublishAt) {
      updateData.scheduledPublishAt = new Date(scheduledPublishAt)
    } else {
      updateData.publishedAt = new Date()
    }
  } else if (action === 'publish') {
    updateData.status = 'published'
    updateData.publishedAt = new Date()
  } else if (action === 'reject') {
    updateData.status = 'rejected'
  }

  const article = await prisma.article.update({
    where: { id },
    data: updateData,
    include: { category: true },
  })

  return NextResponse.json(article)
}
