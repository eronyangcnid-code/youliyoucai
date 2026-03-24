import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { formatDateTime, slotToLabel } from '@/lib/utils'
import type { Metadata } from 'next'
import ShareButtons from '@/components/public/ShareButtons'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!article) return { title: '文章不存在' }

  return {
    title: article.title,
    description: article.summary || undefined,
    openGraph: {
      title: article.title,
      description: article.summary || undefined,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true },
  })

  if (!article || article.status !== 'published') {
    notFound()
  }

  // Related articles in same category
  const related = article.categoryId
    ? await prisma.article.findMany({
        where: {
          status: 'published',
          categoryId: article.categoryId,
          id: { not: article.id },
        },
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
        take: 3,
      })
    : []

  const isPrediction = article.articleType === 'prediction'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#14532D]">首頁</Link>
        <span className="mx-2">/</span>
        {article.category && (
          <>
            <Link href={`/category/${article.category.slug}`} className="hover:text-[#14532D]">
              {article.category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-700">{article.title}</span>
      </nav>

      <article>
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {isPrediction && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                今日台股預測
              </span>
            )}
            {article.category && (
              <Link href={`/category/${article.category.slug}`}>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100 hover:bg-green-100">
                  {article.category.name}
                </span>
              </Link>
            )}
            {article.scheduleSlot && (
              <span className="text-sm text-gray-400">{slotToLabel(article.scheduleSlot)}</span>
            )}
          </div>

          <h1
            className="text-3xl font-bold text-gray-900 leading-tight mb-4"
            style={{ fontFamily: 'Noto Serif TC, serif' }}
          >
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {article.publishedAt && (
              <span>發布時間：{formatDateTime(article.publishedAt)}</span>
            )}
            {article.wordCount && (
              <span>約 {article.wordCount.toLocaleString()} 字</span>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
                <span className="text-sm text-gray-500 hover:text-[#14532D] cursor-pointer">
                  #{tag}
                </span>
              </Link>
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="article-content bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
          <strong>免責聲明：</strong>本文由 AI 綜合整理公開財經資訊，僅供參考，不構成任何投資建議。
          {isPrediction && (
            <span>預測僅供參考，投資須自行判斷，作者及平台不負任何損益責任。</span>
          )}
        </div>

        {/* Source note */}
        {article.sourceFeeds.length > 0 && (
          <div className="mt-2 text-xs text-gray-400">
            資料整合整理自：{article.sourceFeeds.join('、')}等公開財經媒體
          </div>
        )}

        {/* Share */}
        <div className="mt-8">
          <ShareButtons title={article.title} />
        </div>
      </article>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2
            className="text-xl font-bold text-gray-800 mb-6"
            style={{ fontFamily: 'Noto Serif TC, serif' }}
          >
            延伸閱讀
          </h2>
          <div className="space-y-4">
            {related.map((rel) => (
              <Link
                key={rel.id}
                href={`/article/${rel.slug}`}
                className="block bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-green-200 transition-all"
              >
                <div className="text-xs text-gray-400 mb-1">
                  {rel.category?.name} · {rel.publishedAt ? formatDateTime(rel.publishedAt) : ''}
                </div>
                <h3 className="font-semibold text-gray-900 hover:text-[#14532D]">{rel.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
