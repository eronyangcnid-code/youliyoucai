'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Article = {
  id: string
  title: string
  content: string
  summary?: string | null
  status: string
  tags: string[]
  categoryId?: string | null
  wordCount?: number | null
  similarityScore?: number | null
  scheduleSlot?: string | null
}

type Category = { id: string; name: string }

export default function ArticleEditClient({
  article,
  categories,
}: {
  article: Article
  categories: Category[]
}) {
  const [title, setTitle] = useState(article.title)
  const [content, setContent] = useState(article.content)
  const [summary, setSummary] = useState(article.summary || '')
  const [tags, setTags] = useState(article.tags.join(', '))
  const [categoryId, setCategoryId] = useState(article.categoryId || '')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const router = useRouter()

  async function handleSave() {
    setSaving(true)
    try {
      await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          summary,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
          categoryId: categoryId || null,
        }),
      })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleSendReview() {
    setSending(true)
    try {
      await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      })
      router.push('/admin/review')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Noto Serif TC' }}>
            編輯文章
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Eye size={16} />
            {preview ? '編輯' : '預覽'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? '儲存中...' : '儲存草稿'}
          </button>
          {['draft', 'rejected'].includes(article.status) && (
            <button
              onClick={handleSendReview}
              disabled={sending}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-[#14532D] text-white rounded-lg hover:bg-[#166534] disabled:opacity-60"
            >
              {sending ? '送出中...' : '送審'}
            </button>
          )}
        </div>
      </div>

      {/* Title & meta */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-xl font-bold text-gray-800 border-0 border-b border-gray-100 pb-2 focus:outline-none focus:border-[#14532D]"
          style={{ fontFamily: 'Noto Serif TC' }}
          placeholder="文章標題"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">分類</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#14532D]"
            >
              <option value="">未分類</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">標籤（逗號分隔）</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#14532D]"
              placeholder="標籤1, 標籤2, 標籤3"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">摘要（150 字以內）</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#14532D] resize-none"
            rows={2}
            placeholder="文章摘要"
          />
        </div>
      </div>

      {/* Content editor / preview */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {preview ? (
          <div className="h-full overflow-y-auto p-6 article-content prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-6 text-gray-800 text-sm leading-relaxed resize-none focus:outline-none font-mono"
            placeholder="在此輸入 Markdown 內容..."
          />
        )}
      </div>
    </div>
  )
}
