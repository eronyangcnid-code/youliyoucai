import { prisma } from '@/lib/db'
import { formatDateTime, slotToLabel } from '@/lib/utils'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, AlertCircle, Play } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [todayLogs, pendingCount, warningCount, recentArticles, sources] = await Promise.all([
    prisma.scheduleLog.findMany({
      where: { createdAt: { gte: today, lt: tomorrow } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.article.count({ where: { status: 'pending' } }),
    prisma.article.count({ where: { status: 'warning' } }),
    prisma.article.findMany({
      where: { createdAt: { gte: today, lt: tomorrow } },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.dataSource.findMany({
      where: { isActive: true },
      orderBy: { lastChecked: 'desc' },
    }),
  ])

  return { todayLogs, pendingCount, warningCount, recentArticles, sources }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'success')
    return (
      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
        <CheckCircle size={16} /> 成功
      </span>
    )
  if (status === 'failed')
    return (
      <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
        <XCircle size={16} /> 失敗
      </span>
    )
  return (
    <span className="flex items-center gap-1 text-yellow-600 text-sm font-medium">
      <Clock size={16} /> 等待中
    </span>
  )
}

export default async function DashboardPage() {
  const { todayLogs, pendingCount, warningCount, recentArticles, sources } =
    await getDashboardData()

  const slots = ['morning', 'afternoon', 'evening'] as const
  const slotLogs = slots.map((slot) => ({
    slot,
    log: todayLogs.find((l) => l.slot === slot),
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif TC' }}>
        儀表板
      </h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-sm text-gray-500">待審核</div>
          <div className="text-3xl font-bold text-[#14532D] mt-1">{pendingCount}</div>
          <Link href="/admin/review" className="text-xs text-green-600 hover:underline mt-1 block">
            前往審核 →
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-sm text-gray-500">相似度警告</div>
          <div className="text-3xl font-bold text-yellow-600 mt-1">{warningCount}</div>
          <Link
            href="/admin/review?status=warning"
            className="text-xs text-yellow-600 hover:underline mt-1 block"
          >
            查看警告 →
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-sm text-gray-500">今日排程執行</div>
          <div className="text-3xl font-bold text-gray-800 mt-1">{todayLogs.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="text-sm text-gray-500">今日文章</div>
          <div className="text-3xl font-bold text-gray-800 mt-1">{recentArticles.length}</div>
        </div>
      </div>

      {/* Today's schedule status */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">今日排程狀態</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {slotLogs.map(({ slot, log }) => (
            <div
              key={slot}
              className="border border-gray-100 rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-gray-700">{slotToLabel(slot)}</div>
                {log?.createdAt && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    {formatDateTime(log.createdAt)}
                  </div>
                )}
              </div>
              {log ? (
                <StatusBadge status={log.status} />
              ) : (
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <AlertCircle size={16} /> 尚未執行
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Manual trigger */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <TriggerButtons />
        </div>
      </div>

      {/* Sources health */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">資料來源狀態</h2>
          <Link href="/admin/sources" className="text-sm text-green-600 hover:underline">
            管理來源 →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {sources.slice(0, 12).map((source) => (
            <div key={source.id} className="flex items-center gap-2 text-sm">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  source.lastStatus === 'ok'
                    ? 'bg-green-500'
                    : source.lastStatus === 'error'
                    ? 'bg-red-500'
                    : 'bg-gray-300'
                }`}
              />
              <span className="text-gray-600 truncate">{source.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TriggerButtons() {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-gray-500">手動觸發排程：</span>
      {[
        { slot: 'morning', label: '早場' },
        { slot: 'afternoon', label: '午場' },
        { slot: 'evening', label: '晚場' },
      ].map(({ slot, label }) => (
        <TriggerButton key={slot} slot={slot} label={label} />
      ))}
    </div>
  )
}

// Note: client component for trigger buttons
function TriggerButton({ slot, label }: { slot: string; label: string }) {
  return (
    <form action={`/api/admin/schedule/trigger`} method="post">
      <input type="hidden" name="slot" value={slot} />
      <Link
        href={`/admin/schedule?trigger=${slot}`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#14532D] text-white rounded-lg hover:bg-[#166534] transition-colors"
      >
        <Play size={12} />
        {label}
      </Link>
    </form>
  )
}
