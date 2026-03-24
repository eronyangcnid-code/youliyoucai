import { prisma } from '@/lib/db'
import ArticleCard from '@/components/public/ArticleCard'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '今日台股預測 — 有理有財',
  description: '每日早上 06:00 發布，整合那斯達克指數、台積電 ADR 走勢，預測今日台股大盤方向。',
}

export default async function PredictionPage() {
  const articles = await prisma.article.findMany({
    where: { status: 'published', articleType: 'prediction' },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold text-[#14532D] mb-2"
          style={{ fontFamily: 'Noto Serif TC, serif' }}
        >
          今日台股預測
        </h1>
        <p className="text-gray-600">
          每日早上 06:00 自動發布，整合前一日美股那斯達克指數、台積電 ADR 走勢及財經時事，
          預測當日台股大盤可能走向。
        </p>
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          本區所有預測文章僅供參考，不構成投資建議，投資須自行判斷，作者及平台不負任何損益責任。
        </div>
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-400 text-center py-16">尚無預測文章，每日早上 06:00 自動更新</p>
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
