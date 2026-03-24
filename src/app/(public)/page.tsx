import { prisma } from '@/lib/db'
import ArticleCard from '@/components/public/ArticleCard'
import MarketWidget from '@/components/public/MarketWidget'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function getTodayFeatured() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const slots = ['morning', 'afternoon', 'evening'] as const
  const featured = await Promise.all(
    slots.map((slot) =>
      prisma.article.findFirst({
        where: {
          status: 'published',
          scheduleSlot: slot,
          publishedAt: { gte: today, lt: tomorrow },
        },
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
      })
    )
  )

  return featured.filter(Boolean)
}

async function getRecentArticles(page = 1, limit = 9) {
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'published' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where: { status: 'published' } }),
  ])
  return { articles, total }
}

async function getPopularCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { articles: { where: { status: 'published' } } } },
    },
    orderBy: { articles: { _count: 'desc' } },
    take: 8,
  })
}

export default async function HomePage() {
  const [featured, { articles }, categories] = await Promise.all([
    getTodayFeatured(),
    getRecentArticles(),
    getPopularCategories(),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Featured Today Section */}
      {featured.length > 0 && (
        <section className="mb-10">
          <h1
            className="text-2xl font-bold text-[#14532D] mb-1"
            style={{ fontFamily: 'Noto Serif TC, serif' }}
          >
            今日精選
          </h1>
          <p className="text-sm text-gray-500 mb-6">每日早場 06:00、午場 14:00、晚場 20:00 更新</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((article) => (
              <ArticleCard key={article!.id} article={article!} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Articles */}
        <div className="flex-1">
          <h2
            className="text-xl font-bold text-gray-800 mb-6"
            style={{ fontFamily: 'Noto Serif TC, serif' }}
          >
            最新文章
          </h2>
          {articles.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg mb-2">目前尚無文章</p>
              <p className="text-sm">每日三場自動更新，敬請期待</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-72 space-y-6">
          {/* Market Widget */}
          <MarketWidget />

          {/* Popular Categories */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-700 mb-4">熱門分類</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="flex items-center justify-between py-1.5 hover:text-[#14532D] group"
                >
                  <span className="text-sm text-gray-600 group-hover:text-[#14532D]">
                    {cat.name}
                  </span>
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    {cat._count.articles}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Prediction Link */}
          <Link href="/prediction">
            <div className="bg-gradient-to-br from-[#14532D] to-[#166534] text-white rounded-xl p-5 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-yellow-400 font-bold text-lg mb-1">今日台股預測</div>
              <p className="text-green-100 text-sm">
                每日早上 06:00 發布，整合美股那指、台積電 ADR，預測今日大盤走向。
              </p>
            </div>
          </Link>
        </aside>
      </div>
    </div>
  )
}
