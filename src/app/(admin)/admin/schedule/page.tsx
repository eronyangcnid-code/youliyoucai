'use client'

import { useState } from 'react'
import { Play, RefreshCw } from 'lucide-react'

const SLOTS = [
  { key: 'morning', label: '早場 06:00', desc: '台股盤前預測文章' },
  { key: 'afternoon', label: '午場 14:00', desc: '深度理財知識文' },
  { key: 'evening', label: '晚場 20:00', desc: '生活理財文章' },
]

export default function SchedulePage() {
  const [triggering, setTriggering] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, string>>({})

  async function trigger(slot: string) {
    setTriggering(slot)
    try {
      const res = await fetch('/api/admin/schedule/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot }),
      })
      const data = await res.json()
      if (data.success) {
        setResults((prev) => ({ ...prev, [slot]: `成功！文章 ID: ${data.articleId}` }))
      } else {
        setResults((prev) => ({ ...prev, [slot]: `失敗：${data.error}` }))
      }
    } catch {
      setResults((prev) => ({ ...prev, [slot]: '執行失敗，請確認 API 金鑰設定' }))
    } finally {
      setTriggering(null)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif TC' }}>
        排程管理
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SLOTS.map(({ key, label, desc }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{label}</h2>
            <p className="text-sm text-gray-500 mb-6">{desc}</p>

            {results[key] && (
              <div
                className={`text-sm p-3 rounded-lg mb-4 ${
                  results[key].startsWith('成功')
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : 'bg-red-50 text-red-700 border border-red-100'
                }`}
              >
                {results[key]}
              </div>
            )}

            <button
              onClick={() => trigger(key)}
              disabled={triggering === key}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#14532D] text-white rounded-lg text-sm font-medium hover:bg-[#166534] disabled:opacity-60 transition-colors"
            >
              {triggering === key ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  生成中...（可能需要 1–2 分鐘）
                </>
              ) : (
                <>
                  <Play size={16} />
                  手動觸發
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Cron 排程時間（UTC+8）</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-gray-600 w-32">30 5 * * *</span>
            <span className="text-gray-800">早場：每日 05:30 執行，06:00 發布</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-gray-600 w-32">30 13 * * *</span>
            <span className="text-gray-800">午場：每日 13:30 執行，14:00 發布</span>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <span className="font-mono text-gray-600 w-32">30 19 * * *</span>
            <span className="text-gray-800">晚場：每日 19:30 執行，20:00 發布</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          排程透過 GitHub Actions Scheduled Workflow 執行，觸發 /api/admin/schedule/trigger API。
        </p>
      </div>
    </div>
  )
}
