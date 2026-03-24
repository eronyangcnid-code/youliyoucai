import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import ArticleEditClient from './ArticleEditClient'

type Props = { params: Promise<{ id: string }> }

export default async function EditPage({ params }: Props) {
  const { id } = await params

  const [article, categories] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!article) notFound()

  return <ArticleEditClient article={article} categories={categories} />
}
