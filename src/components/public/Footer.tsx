import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#14532D] text-green-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ fontFamily: 'Noto Serif TC, serif', color: '#EAB308' }}
            >
              有理有財
            </h3>
            <p className="text-sm text-green-200">讓每一分錢都有道理</p>
            <p className="text-sm text-green-300 mt-3">
              台灣繁體中文理財知識平台，每日三篇 AI 精選財經文章。
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-green-100">快速連結</h4>
            <ul className="space-y-1 text-sm">
              <li><Link href="/prediction" className="hover:text-yellow-400">今日台股預測</Link></li>
              <li><Link href="/category/stocks-etf" className="hover:text-yellow-400">股票 & ETF</Link></li>
              <li><Link href="/category/insurance" className="hover:text-yellow-400">保險規劃</Link></li>
              <li><Link href="/category/retirement" className="hover:text-yellow-400">退休規劃</Link></li>
              <li><Link href="/about" className="hover:text-yellow-400">關於我們</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-green-100">重要聲明</h4>
            <p className="text-xs text-green-300 leading-relaxed">
              本網站所有文章由 AI 綜合整理公開財經資訊，僅供參考，不構成任何投資建議。
              投資有風險，任何投資決策請自行判斷或諮詢專業理財顧問。
            </p>
          </div>
        </div>
        <div className="border-t border-green-700 mt-8 pt-6 text-center text-xs text-green-400">
          <p>© {new Date().getFullYear()} 有理有財. 本站資料整合自公開財經媒體，僅供教育參考用途。</p>
        </div>
      </div>
    </footer>
  )
}
