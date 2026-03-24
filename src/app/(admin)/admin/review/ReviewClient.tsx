'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatDateTime } from '@/lib/utils'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Article = {
  id: string
  title: string
  content: string
  summary?: string | null
  status: string
  tags: string[]
  wordCount?: number | null
  similarityScore?: number | null
  category?: { name: string } | null
  scheduleSlot?: string | null
  createdAt: Date
}

type Category = { id: string; name: string }

type Props = {
  articles: Article[]
  categories: Category[]
  focusId?: string
}

export default function ReviewClient({ articles, categories, focusId }: Props) {
  const [selected, setSelected] = useState<Article | null>(
    focusId ? articles.find((a) => a.id === focusId) || articles[0] : articles[0]
  )
  const [reviewNote, setReviewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAction(action: 'approve' | 'reject' | 'publish') {
    if (!selected) return
    setLoading(true)
    try {
      await fetch(`/api/articles/${selected.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewNote }),
      })
      router.refresh()
      setReviewNote('')
      const remaining = articles.filter((a) => a.id !== selected.id)
      setSelected(remaining[0] || null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif TC' }}>
        審核佇列
      </h1>

      {articles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          目前無待審核文章
        </div>
      ) : (
        <div className="flex gap-4 h-[calc(100vh-12rem)]">
          {/* Article list */}
          <div className="w-72 bg-white rounded-xl border border-gray-100 shadow-sm overflow-y-auto">
            <div className="p-3 border-b border-gray-100 text-sm font-medium text-gray-600">
              {articles.length} 篇待審核
            </div>
            <div className="divide-y divide-gray-50">
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelected(article)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                    selected?.id === article.id ? 'bg-green-50 border-l-2 border-[#14532D]' : ''
                  }`}
                >
                  <div className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">
                    {article.title}
                  </div>
                  <div className="flex items-center gap-2">
                    {article.status === 'warning' && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                        警告
                      </span>
                    )}
                    {article.similarityScore !== null && article.similarityScore !== undefined && (
                      <span className={`text-xs ${article.similarityScore < 0.3 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {(article.similarityScore * 100).toFixed(0)}%
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {article.wordCount?.toLocaleString()} 字
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview & actions */}
          {selected ? (
            <div className="flex-1 flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{selected.title}</h2>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span>分類：{selected.category?.name || '未分類'}</span>
                  <span>場次：{selected.scheduleSlot || '—'}</span>
                  <span>{selected.wordCount?.toLocaleString()} 字</span>
                  {selected.similarityScore !== null && selected.similarityScore !== undefined && (
                    <span className={`font-medium ${selected.similarityScore < 0.3 ? 'text-green-600' : 'text-yellow-600'}`}>
                      相似度：{(selected.similarityScore * 100).toFixed(1)}%
                    </span>
                  )}
                  <span>建立：{formatDateTime(selected.createdAt)}</span>
                </div>
                {selected.tags.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {selected.tags.map((tag) => (
                      <span key={tag} className="text-xs text-gray-400">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 article-content prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selected.content}
                </ReactMarkdown>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="退回原因（退回時必填）..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none mb-3 focus:outline-none focus:ring-2 focus:ring-[#14532D]"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction('publish')}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-[#14532D] text-white rounded-lg text-sm font-medium hover:bg-[#166534] disabled:opacity-60"
                  >
                    <CheckCircle size={16} />
                    立即發布
                  </button>
                  <button
                    onClick={() => handleAction('approve')}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Eye size={16} />
                    通過（排程發布）
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={loading || !reviewNote.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-60"
                  >
                    <XCircle size={16} />
                    退回
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center text-gray-400">
              選擇文章以預覽
            </div>
          )}
        </div>
      )}
    </div>
  )
}
