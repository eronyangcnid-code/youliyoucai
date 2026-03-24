import { prisma } from '@/lib/db'
import ArticleCard from '@/components/public/ArticleCard'
import type { Metadata } from 'next'

export const revalidate = 0

type Props = { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `搜尋「${q}」— 有理有財` : '搜尋 — 有理有財' }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  const articles = query
    ? await prisma.article.findMany({
        where: {
          status: 'published',
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
        take: 30,
      })
    : []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1
        className="text-2xl font-bold text-[#14532D] mb-2"
        style={{ fontFamily: 'Noto Serif TC, serif' }}
      >
        {query ? `搜尋「${query}」` : '文章搜尋'}
      </h1>

      {query && (
        <p className="text-gray-500 mb-8">
          找到 {articles.length} 篇相關文章
        </p>
      )}

      {!query && (
        <p className="text-gray-400 text-center py-16">請在頂部搜尋欄輸入關鍵字</p>
      )}

      {query && articles.length === 0 && (
        <p className="text-gray-400 text-center py-16">
          沒有找到與「{query}」相關的文章
        </p>
      )}

      {articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
