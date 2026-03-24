'use client'

import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'

type Settings = {
  review_mode: string
  disclaimer_text: string
  prediction_disclaimer: string
  notification_email: string
}

const DEFAULTS: Settings = {
  review_mode: 'manual',
  disclaimer_text: '本文由 AI 綜合整理公開財經資訊，僅供參考，不構成任何投資建議。',
  prediction_disclaimer: '預測僅供參考，投資須自行判斷，作者及平台不負任何損益責任。',
  notification_email: '',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => setSettings({ ...DEFAULTS, ...data }))
      .catch(() => {})
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif TC' }}>
        系統設定
      </h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        {/* Review mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">審核模式</label>
          <select
            value={settings.review_mode}
            onChange={(e) => setSettings((s) => ({ ...s, review_mode: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
          >
            <option value="manual">人工審核後發布（預設）</option>
            <option value="auto">自動發布（跳過審核）</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">設定 AI 生成文章後的發布流程</p>
        </div>

        {/* Disclaimer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">標準免責聲明</label>
          <textarea
            value={settings.disclaimer_text}
            onChange={(e) => setSettings((s) => ({ ...s, disclaimer_text: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D] resize-none"
            rows={3}
          />
        </div>

        {/* Prediction disclaimer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">盤前預測附加聲明</label>
          <textarea
            value={settings.prediction_disclaimer}
            onChange={(e) => setSettings((s) => ({ ...s, prediction_disclaimer: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D] resize-none"
            rows={2}
          />
        </div>

        {/* Notification email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">通知信箱（排程失敗時）</label>
          <input
            type="email"
            value={settings.notification_email}
            onChange={(e) => setSettings((s) => ({ ...s, notification_email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532D]"
            placeholder="admin@example.com"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#14532D] text-white rounded-lg font-medium hover:bg-[#166534] disabled:opacity-60 transition-colors"
        >
          <Save size={16} />
          {saved ? '已儲存！' : saving ? '儲存中...' : '儲存設定'}
        </button>
      </div>
    </div>
  )
}
