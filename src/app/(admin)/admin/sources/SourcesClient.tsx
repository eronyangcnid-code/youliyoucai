'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, RefreshCw, Circle } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

type Source = {
  id: string
  name: string
  type: string
  url: string
  slot: string[]
  priority: number
  isActive: boolean
  lastChecked?: Date | null
  lastStatus?: string | null
  errorMsg?: string | null
}

export default function SourcesClient({ initialSources }: { initialSources: Source[] }) {
  const [sources, setSources] = useState(initialSources)
  const [testing, setTesting] = useState<string | null>(null)

  async function testSource(source: Source) {
    setTesting(source.id)
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', id: source.id, url: source.url }),
      })
      const data = await res.json()
      setSources((prev) =>
        prev.map((s) =>
          s.id === source.id
            ? {
                ...s,
                lastStatus: data.ok ? 'ok' : 'error',
                errorMsg: data.ok ? null : data.error,
                lastChecked: new Date(),
              }
            : s
        )
      )
    } finally {
      setTesting(null)
    }
  }

  function StatusIcon({ status }: { status?: string | null }) {
    if (status === 'ok') return <CheckCircle size={16} className="text-green-500" />
    if (status === 'error') return <XCircle size={16} className="text-red-500" />
    return <Circle size={16} className="text-gray-300" />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif TC' }}>
        資料來源管理
      </h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">狀態</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">來源名稱</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">類型</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">場次</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">最後檢查</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sources.map((source) => (
                <tr key={source.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <StatusIcon status={source.lastStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{source.name}</div>
                    <div className="text-xs text-gray-400 truncate max-w-xs">{source.url}</div>
                    {source.errorMsg && (
                      <div className="text-xs text-red-500 mt-0.5">{source.errorMsg}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {source.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {source.slot.join(', ')}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {source.lastChecked ? formatDateTime(source.lastChecked) : '尚未檢查'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => testSource(source)}
                      disabled={testing === source.id}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-60"
                    >
                      <RefreshCw size={12} className={testing === source.id ? 'animate-spin' : ''} />
                      測試連線
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sources.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            尚無資料來源，請先執行資料庫 Seed
          </div>
        )}
      </div>
    </div>
  )
}
