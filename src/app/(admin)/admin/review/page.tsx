import { prisma } from '@/lib/db'
import ReviewClient from './ReviewClient'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ id?: string; status?: string }> }

export default async function ReviewPage({ searchParams }: Props) {
  const { id, status } = await searchParams

  const filterStatus = status || undefined

  const articles = await prisma.article.findMany({
    where: {
      status: filterStatus
        ? { equals: filterStatus as never }
        : { in: ['pending', 'warning'] },
      ...(id && { id }),
    },
    include: { category: true },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  return <ReviewClient articles={articles} categories={categories} focusId={id} />
}
