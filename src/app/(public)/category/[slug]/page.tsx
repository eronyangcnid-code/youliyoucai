import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import ArticleCard from '@/components/public/ArticleCard'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) return { title: '分類不存在' }
  return { title: `${category.name} — 有理有財` }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params

  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) notFound()

  const articles = await prisma.article.findMany({
    where: { status: 'published', categoryId: category.id },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#14532D]">首頁</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{category.name}</span>
      </nav>

      <h1
        className="text-2xl font-bold text-[#14532D] mb-2"
        style={{ fontFamily: 'Noto Serif TC, serif' }}
      >
        {category.name}
      </h1>
      {category.description && (
        <p className="text-gray-600 mb-8">{category.description}</p>
      )}

      {articles.length === 0 ? (
        <p className="text-gray-400 text-center py-16">此分類尚無文章</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
