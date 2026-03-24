import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(title: string, date?: Date): string {
  const d = date || new Date()
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '')

  const slug = title
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 60)

  // For Chinese titles, use pinyin-style romanization isn't practical;
  // instead, generate a shorter descriptor from English words if any, else use date
  const englishWords = title.match(/[a-zA-Z]+/g)
  const baseSlug = englishWords && englishWords.length > 0
    ? englishWords.join('-').toLowerCase().slice(0, 40)
    : 'article'

  return `${baseSlug}-${dateStr}-${Math.random().toString(36).slice(2, 6)}`
}

export function formatDate(date: Date | string, locale = 'zh-TW'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string, locale = 'zh-TW'): string {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function slotToLabel(slot: string): string {
  const labels: Record<string, string> = {
    morning: '早場 06:00',
    afternoon: '午場 14:00',
    evening: '晚場 20:00',
  }
  return labels[slot] || slot
}

export function statusToLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: '草稿',
    pending: '待審核',
    warning: '相似度警告',
    scheduled: '排程發布',
    published: '已發布',
    rejected: '已退回',
    unpublished: '已下架',
  }
  return labels[status] || status
}
