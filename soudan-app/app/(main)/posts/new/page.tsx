'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createPost } from '@/app/actions/posts'

const TAGS = ['恋愛', '仕事', 'メンタル', 'その他']
const MAX_PARTICIPANTS_OPTIONS = [1, 3, 5]

export default function NewPostPage() {
  const [state, action, isPending] = useActionState(createPost, { errors: {} })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/posts" className="text-slate-700 hover:text-slate-900 text-sm font-bold hover:underline">
          ← 相談一覧に戻る
        </Link>
      </div>

      <h1 className="text-4xl font-black text-amber-700 mb-10">
        ✨ 新しい相談を投稿
      </h1>

      <form action={action} className="space-y-6 bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        {state.errors?._root && (
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700 text-sm font-bold">
            ❌ {state.errors._root[0]}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-bold text-slate-800 mb-2">
            💭 タイトル <span className="text-red-600">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            maxLength={100}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-900"
            placeholder="例: 仕事の人間関係について悩んでいます"
          />
          {state.errors?.title && (
            <p className="mt-2 text-sm text-red-600 font-bold">❌ {state.errors.title[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-bold text-slate-800 mb-2">
            📝 本文（任意）
          </label>
          <textarea
            id="content"
            name="content"
            rows={5}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none font-medium text-slate-900"
            placeholder="💡 詳細な内容を書いてください"
          />
        </div>

        <div>
          <label htmlFor="tag" className="block text-sm font-bold text-slate-800 mb-2">
            🏷️ タグ <span className="text-red-600">*</span>
          </label>
          <select
            id="tag"
            name="tag"
            required
            defaultValue=""
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-900"
          >
            <option value="">📍 選択してください</option>
            {TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          {state.errors?.tag && (
            <p className="mt-2 text-sm text-red-600 font-bold">❌ {state.errors.tag[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="max_participants" className="block text-sm font-bold text-slate-800 mb-2">
            👥 最大回答人数 <span className="text-red-600">*</span>
          </label>
          <select
            id="max_participants"
            name="max_participants"
            required
            defaultValue=""
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-medium text-slate-900"
          >
            <option value="">📍 選択してください</option>
            {MAX_PARTICIPANTS_OPTIONS.map((num) => (
              <option key={num} value={num}>
                {num}人
              </option>
            ))}
          </select>
          {state.errors?.max_participants && (
            <p className="mt-2 text-sm text-red-600 font-bold">❌ {state.errors.max_participants[0]}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95"
          >
            {isPending ? '📤 投稿中...' : '📤 投稿する'}
          </button>
          <Link
            href="/posts"
            className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-slate-900 font-bold rounded-lg transition text-center transform hover:scale-105 active:scale-95"
          >
            ❌ キャンセル
          </Link>
        </div>
      </form>
    </div>
  )
}
