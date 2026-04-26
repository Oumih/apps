'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { PostListTabs } from '@/components/PostListTabs'
import { useAuth } from '@/contexts/AuthContext'

export default function PostsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'my' | 'all' | 'participating'>('all')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-black text-amber-700">
          💬 相談一覧
        </h1>
        <Link
          href="/posts/new"
          className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all transform hover:scale-110 active:scale-95"
        >
          ✨ 新しい相談
        </Link>
      </div>

      {/* Tabs */}
      {user && (
        <div className="flex gap-2 mb-8 bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'my'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
            }`}
          >
            👤 私の投稿
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'all'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
            }`}
          >
            🌍 みんなの相談
          </button>
          <button
            onClick={() => setActiveTab('participating')}
            className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'participating'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
            }`}
          >
            ✅ 参加中の相談
          </button>
        </div>
      )}

      <PostListTabs activeTab={activeTab} currentUserId={user?.id} />
    </div>
  )
}
