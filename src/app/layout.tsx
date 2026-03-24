import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '有理有財 — 讓每一分錢都有道理',
    template: '%s | 有理有財',
  },
  description: '台灣繁體中文理財知識平台，每日精選財經資訊，由 AI 綜合整理，讓理財更簡單。',
  openGraph: {
    siteName: '有理有財',
    locale: 'zh_TW',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
