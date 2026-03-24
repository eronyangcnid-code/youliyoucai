'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

type TWSEData = {
  price: number
  change: number
  changePercent: number
}

export default function MarketWidget() {
  const [data, setData] = useState<TWSEData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  async function fetchData() {
    try {
      const res = await fetch('/api/market')
      const json = await res.json()
      if (json.twse && json.twse.price != null && !isNaN(json.twse.price)) {
        setData(json.twse)
        setLastUpdated(new Date(json.timestamp).toLocaleTimeString('zh-TW'))
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-500 mb-2">台股大盤</h3>
        <div className="animate-pulse h-8 bg-gray-100 rounded"></div>
      </div>
    )
  }

  if (!data || data.price == null) return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-500 mb-1">台股加權指數</h3>
      <p className="text-xs text-gray-400">非交易時間，資料暫不顯示</p>
    </div>
  )

  const isUp = data.change >= 0

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center justify-between">
        <span>台股加權指數</span>
        <span className="text-xs text-gray-400">每 5 分鐘更新</span>
      </h3>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-gray-900">
          {data.price.toLocaleString()}
        </span>
        <div className={`flex items-center gap-1 ${isUp ? 'text-green-600' : 'text-red-500'}`}>
          {isUp ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          <span className="font-medium text-sm">
            {isUp ? '+' : ''}{data.change.toFixed(2)} ({isUp ? '+' : ''}{data.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
      {lastUpdated && (
        <p className="text-xs text-gray-400 mt-1">更新時間：{lastUpdated}</p>
      )}
    </div>
  )
}
