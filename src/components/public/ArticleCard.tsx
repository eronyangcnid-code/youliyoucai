import Link from 'next/link'
import { formatDate, slotToLabel, statusToLabel } from '@/lib/utils'

type Article = {
  id: string
  title: string
  slug: string
  summary?: string | null
  articleType: string
  scheduleSlot?: string | null
  publishedAt?: Date | string | null
  tags: string[]
  category?: { name: string; slug: string } | null
}

export default function ArticleCard({ article }: { article: Article }) {
  const isPrediction = article.articleType === 'prediction'

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {isPrediction && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
              今日台股預測
            </span>
          )}
          {article.category && (
            <Link href={`/category/${article.category.slug}`}>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100 hover:bg-green-100">
                {article.category.name}
              </span>
            </Link>
          )}
          {article.scheduleSlot && (
            <span className="text-xs text-gray-400">{slotToLabel(article.scheduleSlot)}</span>
          )}
        </div>

        {/* Title */}
        <h2 className="mb-2">
          <Link
            href={`/article/${article.slug}`}
            className="text-lg font-semibold text-gray-900 hover:text-[#14532D] transition-colors line-clamp-2"
            style={{ fontFamily: 'Noto Serif TC, serif' }}
          >
            {article.title}
          </Link>
        </h2>

        {/* Summary */}
        {article.summary && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">{article.summary}</p>
        )}

        {/* Tags & Date */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={`/tag/${encodeURIComponent(tag)}`}>
                <span className="text-xs text-gray-500 hover:text-[#14532D] cursor-pointer">
                  #{tag}
                </span>
              </Link>
            ))}
          </div>
          {article.publishedAt && (
            <span className="text-xs text-gray-400">
              {formatDate(article.publishedAt)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
