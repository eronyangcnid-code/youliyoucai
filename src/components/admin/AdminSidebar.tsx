'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Clock,
  Database,
  ScrollText,
  Settings,
  LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: '儀表板', icon: LayoutDashboard },
  { href: '/admin/articles', label: '文章管理', icon: FileText },
  { href: '/admin/review', label: '審核佇列', icon: CheckSquare },
  { href: '/admin/schedule', label: '排程管理', icon: Clock },
  { href: '/admin/sources', label: '資料來源', icon: Database },
  { href: '/admin/logs', label: '排程紀錄', icon: ScrollText },
  { href: '/admin/settings', label: '系統設定', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-[#14532D] text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-green-700">
        <Link href="/" target="_blank">
          <h1
            className="text-xl font-bold"
            style={{ fontFamily: 'Noto Serif TC, serif', color: '#EAB308' }}
          >
            有理有財
          </h1>
          <p className="text-green-300 text-xs mt-0.5">管理後台</p>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-green-700 text-white font-medium'
                  : 'text-green-200 hover:bg-green-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-green-700">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-green-200 hover:bg-green-800 hover:text-white w-full transition-colors"
        >
          <LogOut size={18} />
          登出
        </button>
      </div>
    </aside>
  )
}
