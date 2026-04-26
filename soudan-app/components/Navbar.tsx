'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { logout } from '@/app/actions/auth'
import { supabase } from '@/lib/supabase-browser'

export function Navbar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [displayName, setDisplayName] = useState<string>('')

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single()

        if (data?.display_name) {
          setDisplayName(data.display_name)
        }
      }
      fetchProfile()
    }
  }, [user])

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  const navTabs = [
    { label: '相談一覧', path: '/posts' },
    { label: 'マイページ', path: '/mypage' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top bar with logo and user info */}
        <div className="h-16 flex items-center justify-between">
          <Link href="/posts" className="text-2xl font-black text-slate-900">
            ✨ soudan-app
          </Link>

          <div className="flex items-center gap-6">
            {user && (
              <>
                <span className="text-sm font-semibold text-slate-700">
                  {displayName || user.email}
                </span>
                <button
                  onClick={() => logout()}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline transition"
                >
                  ログアウト
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        {user && (
          <div className="flex gap-3 px-0 py-3">
            {navTabs.map((tab) => (
              <Link
                key={tab.path}
                href={tab.path}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition ${
                  isActive(tab.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
