import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '關於我們 — 有理有財',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1
        className="text-3xl font-bold text-[#14532D] mb-6"
        style={{ fontFamily: 'Noto Serif TC, serif' }}
      >
        關於有理有財
      </h1>

      <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
        <p>
          「有理有財」是以台灣讀者為核心的繁體中文理財知識平台，秉持「讓每一分錢都有道理」的理念，
          每日自動彙整多元理財資訊，由 AI 生成主題各異的深度文章。
        </p>

        <h2 className="text-xl font-bold text-[#14532D]" style={{ fontFamily: 'Noto Serif TC, serif' }}>
          我們的資料來源
        </h2>
        <p>
          本站透過合法的 RSS Feed 訂閱、官方金融 API 及公開授權資料取得素材，
          完全不進行未授權爬蟲。資料來源包含：
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>鉅亨網、MoneyDJ、Smart 智富、今周刊等台灣主流財經媒體 RSS</li>
          <li>Alpha Vantage API（美股指數、商品行情）</li>
          <li>台灣證券交易所（TWSE）官方開放資料 API</li>
          <li>金管會、財政部等政府機關公開授權資料</li>
        </ul>

        <h2 className="text-xl font-bold text-[#14532D]" style={{ fontFamily: 'Noto Serif TC, serif' }}>
          AI 生成說明
        </h2>
        <p>
          所有文章皆由 AI（Anthropic Claude）以原始素材標題與摘要為方向，進行原創改寫。
          我們嚴格確保文章與原文相似度低於 30%，不直接複製任何原文，並落實著作權規範。
        </p>

        <h2 className="text-xl font-bold text-[#14532D]" style={{ fontFamily: 'Noto Serif TC, serif' }}>
          每日發布排程
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>早場 06:00</strong>：台股盤前預測文章，整合前一日美股及台積電 ADR 走勢</li>
          <li><strong>午場 14:00</strong>：投資理財深度知識文（ETF、基金、股票觀念等）</li>
          <li><strong>晚場 20:00</strong>：生活理財文章（保險、退休、節稅、省錢等）</li>
        </ul>

        <div className="mt-8 p-5 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-2">重要免責聲明</h3>
          <p className="text-sm text-gray-600">
            本網站所有文章由 AI 綜合整理公開財經資訊，僅供參考，不構成任何投資建議。
            投資有風險，任何投資決策請自行判斷，或諮詢合格的理財規劃顧問。
            本站對任何因參考本站內容而產生的損益不負任何責任。
          </p>
        </div>
      </div>
    </div>
  )
}
