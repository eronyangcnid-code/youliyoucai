import { prisma } from '@/lib/db'
import { formatDateTime, slotToLabel } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ page?: string }> }

export default async function LogsPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams
  const page = parseInt(pageStr || '1')
  const limit = 30

  const [logs, total] = await Promise.all([
    prisma.scheduleLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.scheduleLog.count(),
  ])

  const totalPages = Math.ceil(total / limit)

  function StatusIcon({ status }: { status: string }) {
    if (status === 'success') return <CheckCircle size={16} className="text-green-500" />
    if (status === 'failed') return <XCircle size={16} className="text-red-500" />
    return <Clock size={16} className="text-yellow-500" />
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif TC' }}>
        排程紀錄
      </h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">狀態</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">場次</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">文章 ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">耗時</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">錯誤訊息</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">執行時間</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <StatusIcon status={log.status} />
                </td>
                <td className="px-4 py-3 text-gray-700">{slotToLabel(log.slot)}</td>
                <td className="px-4 py-3">
                  {log.articleId ? (
                    <Link
                      href={`/admin/articles/${log.articleId}/edit`}
                      className="text-xs text-blue-600 hover:underline font-mono"
                    >
                      {log.articleId.slice(0, 8)}...
                    </Link>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {log.duration ? `${(log.duration / 1000).toFixed(1)}s` : '—'}
                </td>
                <td className="px-4 py-3 text-red-500 text-xs max-w-xs truncate">
                  {log.errorMsg || '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {formatDateTime(log.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-400">尚無排程紀錄</div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">第 {page} / {totalPages} 頁</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/logs?page=${page - 1}`}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  上一頁
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/logs?page=${page + 1}`}
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
