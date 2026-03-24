import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const article = await prisma.article.findUnique({
    where: { id },
    include: { category: true, reviewedBy: { select: { name: true, email: true } } },
  })

  if (!article) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(article)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.content && { content: body.content }),
      ...(body.summary !== undefined && { summary: body.summary }),
      ...(body.tags && { tags: body.tags }),
      ...(body.categoryId && { categoryId: body.categoryId }),
      ...(body.status && { status: body.status }),
      ...(body.scheduledPublishAt && { scheduledPublishAt: new Date(body.scheduledPublishAt) }),
    },
    include: { category: true },
  })

  return NextResponse.json(article)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await prisma.article.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
