'use client'

import { useState } from 'react'
import { Link2, Check } from 'lucide-react'

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const encodedUrl = encodeURIComponent(currentUrl)
  const encodedTitle = encodeURIComponent(title)

  function copyLink() {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-gray-500 font-medium">分享：</span>

      {/* LINE */}
      <a
        href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-4 py-2 bg-[#00B900] text-white rounded-full text-sm font-medium hover:bg-[#00a000] transition-colors"
      >
        LINE
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] text-white rounded-full text-sm font-medium hover:bg-[#166fe5] transition-colors"
      >
        Facebook
      </a>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        {copied ? <Check size={14} /> : <Link2 size={14} />}
        {copied ? '已複製' : '複製連結'}
      </button>
    </div>
  )
}
