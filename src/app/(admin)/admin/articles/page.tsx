import { prisma } from '@/lib/db'
import Link from 'next/link'
import { formatDateTime, slotToLabel, statusToLabel } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ status?: string; page?: string; slot?: string }> }

const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待審核' },
  { value: 'warning', label: '相似度警告' },
  { value: 'published', label: '已發布' },
  { value: 'rejected', label: '已退回' },
  { value: 'scheduled', label: '排程發布' },
  { value: 'unpublished', label: '已下架' },
]

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    pending: 'bg-blue-100 text-blue-700',
    warning: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    scheduled: 'bg-purple-100 text-purple-700',
    unpublished: 'bg-orange-100 text-orange-700',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {statusToLabel(status)}
    </span>
  )
}

export default async function ArticlesPage({ searchParams }: Props) {
  const { status, page: pageStr, slot } = await searchParams
  const page = parseInt(pageStr || '1')
  const limit = 20

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (slot) where.scheduleSlot = slot

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif TC' }}>
          文章管理
        </h1>
        <span className="text-sm text-gray-500">共 {total} 篇</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/admin/articles?status=${opt.value}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                status === opt.value || (!status && opt.value === '')
                  ? 'bg-[#14532D] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-1/2">標題</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">狀態</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">場次</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">分類</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">相似度</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">建立時間</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 line-clamp-1">{article.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {article.wordCount?.toLocaleString()} 字
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {article.scheduleSlot ? slotToLabel(article.scheduleSlot) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {article.category?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {article.similarityScore !== null && article.similarityScore !== undefined ? (
                      <span
                        className={`text-xs font-medium ${
                          article.similarityScore < 0.3
                            ? 'text-green-600'
                            : article.similarityScore < 0.5
                            ? 'text-yellow-600'
                            : 'text-red-500'
                        }`}
                      >
                        {(article.similarityScore * 100).toFixed(1)}%
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatDateTime(article.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        編輯
                      </Link>
                      {['pending', 'warning'].includes(article.status) && (
                        <Link
                          href={`/admin/review?id=${article.id}`}
                          className="text-xs text-green-600 hover:underline"
                        >
                          審核
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12 text-gray-400">無文章</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              第 {page} / {totalPages} 頁
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/articles?status=${status || ''}&page=${page - 1}`}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  上一頁
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/articles?status=${status || ''}&page=${page + 1}`}
                  className="px-3 py-1.5 text-sm bg-[#14532D] text-white rounded-lg hover:bg-[#166534]"
                >
                  下一頁
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
