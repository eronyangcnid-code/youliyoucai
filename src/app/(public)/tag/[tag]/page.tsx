import { prisma } from '@/lib/db'
import ArticleCard from '@/components/public/ArticleCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ tag: string }> }

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      tags: { has: decodedTag },
    },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#14532D]">首頁</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">#{decodedTag}</span>
      </nav>

      <h1
        className="text-2xl font-bold text-[#14532D] mb-6"
        style={{ fontFamily: 'Noto Serif TC, serif' }}
      >
        #{decodedTag}
      </h1>

      {articles.length === 0 ? (
        <p className="text-gray-400 text-center py-16">此標籤尚無文章</p>
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
