'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { name: '財經時事', slug: 'financial-news' },
  { name: '投資入門', slug: 'investment-basics' },
  { name: '股票 & ETF', slug: 'stocks-etf' },
  { name: '基金 & 債券', slug: 'funds-bonds' },
  { name: '房地產', slug: 'real-estate' },
  { name: '保險規劃', slug: 'insurance' },
  { name: '退休規劃', slug: 'retirement' },
  { name: '節稅 & 稅務', slug: 'tax' },
  { name: '省錢 & 記帳', slug: 'savings' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="bg-[#14532D] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: 'Noto Serif TC, serif', color: '#EAB308' }}
            >
              有理有財
            </span>
            <span className="text-xs text-green-200 hidden sm:block">讓每一分錢都有道理</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋文章..."
                className="bg-green-800 text-white placeholder-green-300 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 w-48"
              />
              <button type="submit" className="absolute right-3 top-2.5">
                <Search size={16} className="text-green-300" />
              </button>
            </div>
          </form>

          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="開啟選單"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Category nav */}
        <nav className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto">
          <Link
            href="/prediction"
            className="flex-shrink-0 px-3 py-1 rounded text-sm bg-yellow-500 text-green-900 font-medium hover:bg-yellow-400 transition-colors"
          >
            今日台股預測
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex-shrink-0 px-3 py-1 rounded text-sm text-green-100 hover:bg-green-700 transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-green-700 pb-4">
          <form onSubmit={handleSearch} className="px-4 py-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋文章..."
                className="bg-green-800 text-white placeholder-green-300 rounded-full pl-4 pr-10 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button type="submit" className="absolute right-3 top-2.5">
                <Search size={16} className="text-green-300" />
              </button>
            </div>
          </form>
          <div className="px-4 space-y-1">
            <Link
              href="/prediction"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded text-sm bg-yellow-500 text-green-900 font-medium"
            >
              今日台股預測
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded text-sm text-green-100 hover:bg-green-700"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
